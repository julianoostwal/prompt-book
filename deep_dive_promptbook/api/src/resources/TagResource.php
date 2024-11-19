<?php

namespace DeepDiveAPI\resources;

use DeepDiveAPI\Resource;

class TagResource extends Resource {
    public function get() {
        return [
            'status' => 200,
            'data' => $this->getTags(),
        ];
    }

    public function post() {
        $data = $this->getJsonData();

        if (empty($data['name'])) {
            throw new \Exception("Name is required", 400);
        }

        $tagId = $this->insertTag($data);
        
        return [
            'status' => 201,
            'data' => $this->getTagById($tagId),
        ];
    }

    public function getById($id) {
        return [
            'status' => 200,
            'data' => $this->getTagById($id),
        ];
    }

    public function put($id) {
        $data = $this->getJsonData();

        if (empty($data['name'])) {
            throw new \Exception("Name is required", 400);
        }

        $this->updateTag($id, $data);
        
        return [
            'status' => 200,
            'data' => $this->getTagById($id),
        ];
    }

    public function delete($id) {
        $this->deleteTagById($id);

        return [
            'status' => 204,
            'data' => null,
        ];
    }

    // Private functions to handle database operations
    private function getTags() {
        $stmt = $this->pdo->prepare("SELECT * FROM tag");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    private function getTagById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM tag WHERE id = :id");
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $tag = $stmt->fetch();

        if (!$tag) {
            throw new \Exception('Tag not found', 404);
        }

        return $tag;
    }

    private function insertTag($data) {
        $stmt = $this->pdo->prepare("INSERT INTO tag (name) VALUES (:name)");
        $stmt->bindValue(':name', $data['name']);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    private function updateTag($id, $data) {
        $stmt = $this->pdo->prepare("UPDATE tag SET name = :name WHERE id = :id");
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->bindValue(':name', $data['name']);
        $stmt->execute();
    }

    private function deleteTagById($id) {
        $stmt = $this->pdo->prepare("DELETE FROM tag WHERE id = :id");
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Tag not found', 404);
        }
    }
}
