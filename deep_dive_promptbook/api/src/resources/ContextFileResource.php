<?php

namespace DeepDiveAPI\resources;

use DeepDiveAPI\Resource;

class ContextFileResource extends Resource {
    public function get() {
        return [
            'status' => 200,
            'data' => $this->getContextFiles(),
        ];
    }

    public function getById($id) {
        return [
            'status' => 200,
            'data' => $this->getContextFile($id),
        ];
    }

    public function post() {
        $data = $this->getJsonData();

        if (empty($data['composite_prompt_id']) || empty($data['filename']) || empty($data['file_path'])) {
            throw new \Exception("composite_prompt_id, filename, and file_path are required", 400);
        }

        $contextFileId = $this->insertContextFile($data);
        
        return [
            'status' => 201,
            'data' => $this->getContextFile($contextFileId),
        ];
    }

    public function put($id) {
        $data = $this->getJsonData();

        if (empty($data['composite_prompt_id']) || empty($data['filename']) || empty($data['file_path'])) {
            throw new \Exception("composite_prompt_id, filename, and file_path are required", 400);
        }

        return [
            'status' => 200,
            'data' => $this->updateContextFile($id, $data),
        ];
    }

    public function delete($id) {
        $this->deleteContextFileById($id);

        return [
            'status' => 204,
            'data' => null,
        ];
    }

    // Private functions to handle database operations
    private function getContextFiles() {
        $query = "SELECT * FROM context_file";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll();
        return $results;
    }

    private function getContextFile($id) {
        $query = "SELECT * FROM context_file WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch();

        if (!$result) {
            throw new \Exception('Context file not found', 404);
        }

        return $result;
    }

    private function insertContextFile($data) {
        $query = "INSERT INTO context_file (composite_prompt_id, filename, file_path, description) VALUES (:composite_prompt_id, :filename, :file_path, :description)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':composite_prompt_id', $data['composite_prompt_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':filename', $data['filename']);
        $stmt->bindValue(':file_path', $data['file_path']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    private function updateContextFile($id, $data) {
        $query = "UPDATE context_file SET composite_prompt_id = :composite_prompt_id, filename = :filename, file_path = :file_path, description = :description WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->bindValue(':composite_prompt_id', $data['composite_prompt_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':filename', $data['filename']);
        $stmt->bindValue(':file_path', $data['file_path']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->execute();

        return $this->getContextFile($id);
    }

    private function deleteContextFileById($id) {
        $query = "DELETE FROM context_file WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Context file not found', 404);
        }
    }
}
