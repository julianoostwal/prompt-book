<?php

namespace DeepDiveAPI\resources;

use DeepDiveAPI\Resource;

class ResultExampleResource extends Resource {
    public function get() {
        return [
            'status' => 200,
            'data' => $this->getResultExamples(),
        ];
    }

    public function getById($id) {
        return [
            'status' => 200,
            'data' => $this->getResultExample($id),
        ];
    }

    public function post() {
        $data = $this->getJsonData();

        if (empty($data['composite_prompt_id']) || empty($data['result_content'])) {
            throw new \Exception("composite_prompt_id and result_content are required", 400);
        }

        $resultExampleId = $this->insertResultExample($data);
        
        return [
            'status' => 201,
            'data' => $this->getResultExample($resultExampleId),
        ];
    }

    public function put($id) {
        $data = $this->getJsonData();

        if (empty($data['composite_prompt_id']) || empty($data['result_content'])) {
            throw new \Exception("composite_prompt_id and result_content are required", 400);
        }

        return [
            'status' => 200,
            'data' => $this->updateResultExample($id, $data),
        ];
    }

    public function delete($id) {
        $this->deleteResultExampleById($id);

        return [
            'status' => 204,
            'data' => null,
        ];
    }

    // Private functions to handle database operations
    private function getResultExamples() {
        $query = "SELECT * FROM result_example";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll();
        return $results;
    }

    private function getResultExample($id) {
        $query = "SELECT * FROM result_example WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch();

        if (!$result) {
            throw new \Exception('Result example not found', 404);
        }

        return $result;
    }

    private function insertResultExample($data) {
        $query = "INSERT INTO result_example (composite_prompt_id, result_content) VALUES (:composite_prompt_id, :result_content)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':composite_prompt_id', $data['composite_prompt_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':result_content', $data['result_content']);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    private function updateResultExample($id, $data) {
        $query = "UPDATE result_example SET composite_prompt_id = :composite_prompt_id, result_content = :result_content WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->bindValue(':composite_prompt_id', $data['composite_prompt_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':result_content', $data['result_content']);
        $stmt->execute();

        return $this->getResultExample($id);
    }

    private function deleteResultExampleById($id) {
        $query = "DELETE FROM result_example WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Result example not found', 404);
        }
    }
}
