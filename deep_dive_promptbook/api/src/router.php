<?php

// declare(strict_types=1);

namespace DeepDiveAPI;

// Load the Composer autoloader from the vendor directory one level up from the current directory
require_once __DIR__ . '/../vendor/autoload.php';

// Register routes
// request method, path(regex), resource, method
$routes = [
    // Authors
    ['get',     '/^authors$/i', 'AuthorResource', 'get'],
    ['post',    '/^authors$/i', 'AuthorResource', 'post'],
    ['get',     '/^authors\/([0-9]+)$/i', 'AuthorResource', 'getById'],
    ['put',     '/^authors\/([0-9]+)$/i', 'AuthorResource', 'put'],
    ['delete',  '/^authors\/([0-9]+)$/i', 'AuthorResource', 'delete'],
    ['post', '/^auth\/login$/i', 'AuthorResource', 'login'],
    ['put', '/^authors\/([0-9]+)$/i', 'AuthorResource', 'put'],
    ['get', '/^auth\/status$/i', 'AuthorResource', 'isLoggedIn'],

    // PromptFragments
    ['get',     '/^prompt_fragments$/i', 'PromptFragmentResource', 'get'],
    ['post',    '/^prompt_fragments$/i', 'PromptFragmentResource', 'post'],
    ['get',     '/^prompt_fragments\/([0-9]+)$/i', 'PromptFragmentResource', 'getById'],
    ['get',     '/^prompt_fragments\/([0-9]+)\/with_tags$/i', 'PromptFragmentResource', 'getByIdWithTags'],
    ['put',     '/^prompt_fragments\/([0-9]+)$/i', 'PromptFragmentResource', 'put'],
    ['delete',  '/^prompt_fragments\/([0-9]+)$/i', 'PromptFragmentResource', 'delete'],
    // Linking Tags to Prompt Fragments
    ['post',    '/^prompt_fragments\/([0-9]+)\/tags\/([0-9]+)$/i', 'PromptFragmentResource', 'linkTag'],
    ['delete',  '/^prompt_fragments\/([0-9]+)\/tags\/([0-9]+)$/i', 'PromptFragmentResource', 'unlinkTag'],
    // Tags
    ['get',     '/^tags$/i', 'TagResource', 'get'],
    ['post',    '/^tags$/i', 'TagResource', 'post'],
    ['get',     '/^tags\/([0-9]+)$/i', 'TagResource', 'getById'],
    ['put',     '/^tags\/([0-9]+)$/i', 'TagResource', 'put'],
    ['delete',  '/^tags\/([0-9]+)$/i', 'TagResource', 'delete'],
    // CompositePrompts
    ['get',     '/^composite_prompts$/i', 'CompositePromptResource', 'get'],
    ['post',    '/^composite_prompts$/i', 'CompositePromptResource', 'post'],
    ['get',     '/^composite_prompts\/([0-9]+)$/i', 'CompositePromptResource', 'getById'],
    ['get',     '/^composite_prompts\/([0-9]+)\/expanded$/i', 'CompositePromptResource', 'getByIdExpanded'],
    ['put',     '/^composite_prompts\/([0-9]+)$/i', 'CompositePromptResource', 'put'],
    ['delete',  '/^composite_prompts\/([0-9]+)$/i', 'CompositePromptResource', 'delete'],
    // Linking Prompt Fragments to Composite Prompts
    ['post',    '/^composite_prompts\/([0-9]+)\/fragments\/([0-9]+)$/i', 'CompositePromptResource', 'linkFragment'],
    ['delete',  '/^composite_prompts\/([0-9]+)\/fragments\/([0-9]+)$/i', 'CompositePromptResource', 'unlinkFragment'],
    ['put',     '/^composite_prompts\/([0-9]+)\/fragments\/([0-9]+)$/i', 'CompositePromptResource', 'updateFragmentOrder'],
    // ResultExamples
    ['post',    '/^result_examples$/i', 'ResultExampleResource', 'post'],
    ['get',     '/^result_examples\/([0-9]+)$/i', 'ResultExampleResource', 'getById'],
    ['put',     '/^result_examples\/([0-9]+)$/i', 'ResultExampleResource', 'put'],
    ['delete',  '/^result_examples\/([0-9]+)$/i', 'ResultExampleResource', 'delete'],
    // ContextFiles
    ['post',    '/^context_files$/i', 'ContextFileResource', 'post'],
    ['get',     '/^context_files\/([0-9]+)$/i', 'ContextFileResource', 'getById'],
    ['put',     '/^context_files\/([0-9]+)$/i', 'ContextFileResource', 'put'],
    ['delete',  '/^context_files\/([0-9]+)$/i', 'ContextFileResource', 'delete'],
];

// Disable CORS errors
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Headers: Content-Type");
    exit();
}

// Get the HTTP method
$methodName = match ($_SERVER['REQUEST_METHOD']) {
    'POST' => 'post',
    'PUT' => 'put',
    'DELETE' => 'delete',
    default => 'get',
};

// Parse the URL path and break it into resource and arguments
$urlPath = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

// Log the request
file_put_contents("php://stdout", "Requesting  $urlPath with method $methodName\n");

foreach ($routes as $route) {
    $routeMethod = $route[0];
    $routePath = $route[1];
    $resource = $route[2];
    $method = $route[3];
    
    // continue if the method or path don't match
    if ($methodName != $routeMethod || preg_match($routePath, $urlPath, $matches) === 0) {
        continue;
    }

    $arguments = parseArguments($matches);

    callRoute($resource, $method, $arguments);

    // If no route is found, the client will receive a 404 response
    exit();
}

// If no route is found, the client will receive a 404 response
header('Content-Type: application/json');
http_response_code(404);
echo json_encode(['error' => 'Not found']);
exit();


function callRoute(string $resource, string $method, array|null $arguments) {
    header('Content-Type: application/json');
    try {
        $resourceClassPath = "DeepDiveAPI\\resources\\{$resource}";
        $resource = new $resourceClassPath(getPDO());
        $result = is_null($arguments) ?
            $resource->$method() :
            $resource->$method(...$arguments);
        http_response_code($result['status']);
        if (!empty($result['data'])) {
            echo json_encode($result['data']);
        }
    } catch (\PDOException $e) {
        // Log the error
        file_put_contents("php://stderr", $e->getMessage() . "\n");
        // Handle database exceptions specifically
        if ($e->getCode() == "23000") {
            http_response_code(409); // Conflict - indicates a duplicate entry issue
            echo json_encode(['error' => 'Duplicate entry: The resource already exists.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } catch (\Exception $e) {
        // Log the error
        file_put_contents("php://stderr", $e->getMessage() . "\n");
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function getPDO() {
    $host = $_ENV['DB_HOST'];
    $db   = $_ENV['DB_NAME'];
    $user = $_ENV['DB_USER'];
    $pass = $_ENV['DB_PASS'];
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new \PDO($dsn, $user, $pass, $options);
    return $pdo;
}

function parseArguments(array $matches): array|null {
    if (!empty($matches[1])) {
        return array_map(fn($arg) => (int) $arg, array_slice($matches, 1));
    }
    return null;
}