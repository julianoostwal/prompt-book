<?php

namespace DeepDiveAPI;

class Resource {
    protected $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    protected function getJsonData() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Invalid JSON input", 400);
        }
        return $data;
    }
}
