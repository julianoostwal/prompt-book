<?php

namespace DeepDiveAPI\resources;

use DeepDiveAPI\Resource;

class AuthorResource extends Resource {
    public function get() {
        return [
            'status' => 200,
            'data' => $this->getAuthors(),
        ];
    }

    public function login() {
        $data = $this->getJsonData();

        // Validate input
        if (empty($data['email']) || empty($data['password'])) {
            throw new \Exception("Email and password are required", 400);
        }

        // Fetch the author by email
        $stmt = $this->pdo->prepare("SELECT * FROM author WHERE email = :email");
        $stmt->bindValue(':email', $data['email']);
        $stmt->execute();
        $author = $stmt->fetch();

        if (!$author || !password_verify($data['password'], $author['password_hash'])) {
            throw new \Exception("Invalid email or password", 401);
        }

        // Update last_login
        $stmt = $this->pdo->prepare("UPDATE author SET last_login = NOW() WHERE id = :id");
        $stmt->bindValue(':id', $author['id'], \PDO::PARAM_INT);
        $stmt->execute();

        // Generate a token (use JWT for production)
        $token = base64_encode(json_encode([
            'id' => $author['id'],
            'email' => $author['email'],
            'role' => $author['role'],
            'issued_at' => time(),
        ]));

        return [
            'status' => 200,
            'data' => [
                'token' => $token,
                'author' => [
                    'id' => $author['id'],
                    'name' => $author['name'],
                    'email' => $author['email'],
                    'role' => $author['role'],
                    'last_login' => $author['last_login'],
                ],
            ],
        ];
    }

    public function post() {
        $data = $this->getJsonData();
    
        // Check if all required fields are provided
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            throw new \Exception("Name, email, and password are required", 400);
        }
    
        // Get authenticated user
        $authUser = $this->getAuthenticatedUser();
    
        // Fetch the authenticated user's role directly from the database
        $stmt = $this->pdo->prepare("SELECT role FROM author WHERE id = :id");
        $stmt->bindValue(':id', $authUser['id'], \PDO::PARAM_INT);
        $stmt->execute();
        $userRole = $stmt->fetchColumn();
    
        // Only admins can create other admins
        if (isset($data['role']) && $data['role'] === 'admin' && $userRole !== 'admin') {
            throw new \Exception("Access denied. Admin privileges required to create an admin account.", 403);
        }
    
        // Set the role: if the role is not specified or is not valid, default to 'user'
        $role = isset($data['role']) && in_array($data['role'], ['admin', 'user']) ? $data['role'] : 'user';
    
        // Hash the password
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
    
        // Insert into the database
        $stmt = $this->pdo->prepare("INSERT INTO author (name, role, email, password_hash) VALUES (:name, :role, :email, :password_hash)");
        $stmt->bindValue(':name', $data['name']);
        $stmt->bindValue(':role', $role);
        $stmt->bindValue(':email', $data['email']);
        $stmt->bindValue(':password_hash', $passwordHash);
        $stmt->execute();
    
        $authorId = $this->pdo->lastInsertId();
    
        return [
            'status' => 201,
            'data' => $this->getAuthorById($authorId),
        ];
    }
    
    

    public function getById($id) {
        return [
            'status' => 200,
            'data' => $this->getAuthorById($id),
        ];
    }
    
    public function put($id) {
        $data = $this->getJsonData();
    
        // Check if the user is authorized (admin only for role updates)
        $authUser = $this->getAuthenticatedUser();
        $stmt = $this->pdo->prepare("SELECT role FROM author WHERE id = :id");
        $stmt->bindValue(':id', $authUser['id'], \PDO::PARAM_INT);
        $stmt->execute();
        $userRole = $stmt->fetchColumn();
    
        if (isset($data['role']) && $userRole !== 'admin') {
            throw new \Exception("Access denied. Admin privileges required.", 403);
        }
    
        $stmt = $this->pdo->prepare("UPDATE author SET name = COALESCE(:name, name), role = COALESCE(:role, role) WHERE id = :id");
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->bindValue(':name', $data['name'] ?? null);
        $stmt->bindValue(':role', $data['role'] ?? null);
        $stmt->execute();
    
        return [
            'status' => 200,
            'data' => $this->getAuthorById($id),
        ];
    }    

    public function delete($id) {
        // Check if the user is authorized to delete (admin only)
        $authUser = $this->getAuthenticatedUser();
        if ($authUser['role'] !== 'admin') {
            throw new \Exception("Access denied. Admin privileges required.", 403);
        }

        $this->deleteAuthorById($id);

        return [
            'status' => 204,
            'data' => null,
        ];
    }

    public function isLoggedIn() {
        $authUser = $this->getAuthenticatedUser();
    
        if (!$authUser) {
            throw new \Exception("Invalid or missing token", 401);
        }
    
        // Fetch the user's details from the database
        $stmt = $this->pdo->prepare("SELECT id, name, email, role FROM author WHERE id = :id");
        $stmt->bindValue(':id', $authUser['id'], \PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch();
    
        if (!$user) {
            throw new \Exception("User not found", 404);
        }
    
        return [
            'status' => 200,
            'data' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
            ],
        ];
    }
    

    // Private helper methods
    private function getAuthors() {
        $stmt = $this->pdo->prepare("SELECT id, name, role, email, created_at, updated_at, last_login FROM author");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    private function getAuthorById($id) {
        $stmt = $this->pdo->prepare("SELECT id, name, role, email, created_at, updated_at, last_login FROM author WHERE id = :id");
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $author = $stmt->fetch();

        if (!$author) {
            throw new \Exception('Author not found', 404);
        }

        return $author;
    }

    private function deleteAuthorById($id) {
        $stmt = $this->pdo->prepare("DELETE FROM author WHERE id = :id");
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Author not found', 404);
        }
    }

    private function getAuthenticatedUser() {
        $headers = apache_request_headers();
        if (!isset($headers['Authorization'])) {
            return null;
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $decoded = json_decode(base64_decode($token), true);

        if (!isset($decoded['id'], $decoded['email'], $decoded['role'])) {
            return null;
        }

        return $decoded;
    }
}
