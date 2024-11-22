<?php

namespace DeepDiveAPI\resources;

use DeepDiveAPI\Resource;

class PromptFragmentResource extends Resource {
    public function get() {
        return [
            'status' => 200,
            'data' => $this->getPromptFragments(),
        ];
    }

    public function getById($id) {
        return [
            'status' => 200,
            'data' => $this->getPromptFragment($id),
        ];
    }

    public function getByIdWithTags($id) {
        return [
            'status' => 200,
            'data' => $this->getPromptFragmentWithTags($id),
        ];
    }

    public function post() {
        $data = $this->getJsonData();
    
        if (empty($data['author_id']) || empty($data['content'])) {
            throw new \Exception("Author ID and content are required", 400);
        }
    
        // Insert the prompt fragment
        $id = $this->insertPromptFragment($data);
    
        // If tags are provided, link them to the new prompt fragment
        if (!empty($data['tags']) && is_array($data['tags'])) {
            foreach ($data['tags'] as $tagId) {
                $this->insertPromptFragmentTag($id, $tagId);
            }
        }
    
        return [
            'status' => 201,
            'data' => $this->getPromptFragment($id),
        ];
    }
    
    public function put($id) {
        $data = $this->getJsonData();

        if (empty($data['author_id']) && empty($data['content'])) {
            throw new \Exception("Author ID or content is required", 400);
        }

        return [
            'status' => 200,
            'data' => $this->updatePromptFragment($id, $data),
        ];
    }

    public function delete($id) {
        $this->deletePromptFragment($id);
        return ['status' => 204];
    }

    public function linkTag($fragmentId, $tagId) {
        $this->insertPromptFragmentTag($fragmentId, $tagId);
        return ['status' => 201];
    }

    public function unlinkTag($fragmentId, $tagId) {
        $this->deletePromptFragmentTag($fragmentId, $tagId);
        return ['status' => 204];
    }

    // Private functions to handle database operations
    private function getPromptFragments() {
        $query = "
            SELECT 
                pf.id, 
                pf.content, 
                pf.description, 
                pf.created_at, 
                pf.updated_at,
                COALESCE(
                    JSON_ARRAYAGG(
                        CASE 
                            WHEN t.id IS NOT NULL THEN
                                JSON_OBJECT(
                                    'id', t.id,
                                    'name', t.name
                                )
                        END
                    ), 
                    '[]'
                ) AS tags,
                JSON_OBJECT(
                    'id', a.id,
                    'name', a.name,
                    'email', a.email,
                    'role', a.role
                ) AS author
            FROM prompt_fragment pf
            LEFT JOIN author a ON pf.author_id = a.id
            LEFT JOIN prompt_fragment_tag pft ON pf.id = pft.prompt_fragment_id
            LEFT JOIN tag t ON pft.tag_id = t.id
            GROUP BY pf.id
        ";
    
        $stmt = $this->pdo->query($query);
        $results = $stmt->fetchAll();
        return $results;
    }

    private function getPromptFragment($id) {
        $query = "
            SELECT 
                pf.id, 
                pf.content, 
                pf.description, 
                pf.created_at, 
                pf.updated_at,
                COALESCE(
                    JSON_ARRAYAGG(
                        CASE 
                            WHEN t.id IS NOT NULL THEN
                                JSON_OBJECT(
                                    'id', t.id,
                                    'name', t.name
                                )
                        END
                    ), 
                    '[]'
                ) AS tags,
                JSON_OBJECT(
                    'id', a.id,
                    'name', a.name,
                    'email', a.email,
                    'role', a.role
                ) AS author
            FROM prompt_fragment pf
            LEFT JOIN author a ON pf.author_id = a.id
            LEFT JOIN prompt_fragment_tag pft ON pf.id = pft.prompt_fragment_id
            LEFT JOIN tag t ON pft.tag_id = t.id
            WHERE pf.id = :id
            GROUP BY pf.id
        ";
    
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch();
    
        if (!$result) {
            throw new \Exception("Prompt fragment not found", 404);
        }
    
        return $result;
    }

    private function getPromptFragmentWithTags($id) {
        $query = "SELECT t.id, t.name FROM prompt_fragment_tag pft JOIN tag t ON pft.tag_id = t.id WHERE pft.prompt_fragment_id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $tags = $stmt->fetchAll();

        $promptFragment = $this->getPromptFragment($id);

        return [
            ...$promptFragment,
            "tags" => $tags
        ];
    }

    private function insertPromptFragment($data) {
        $query = "INSERT INTO prompt_fragment (author_id, content, description) VALUES (:author_id, :content, :description)";
        $stmt = $this->pdo->prepare($query);

        $stmt->bindValue(':author_id', $data['author_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':content', $data['content']);
        $stmt->bindValue(':description', $data['description'] ?? null);

        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    private function updatePromptFragment($id, $data) {
        $query = "UPDATE prompt_fragment SET content = :content, description = :description WHERE id = :id";
        $stmt = $this->pdo->prepare($query);

        $stmt->bindValue(':content', $data['content']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);

        $stmt->execute();
        return $this->getPromptFragment($id);
    }

    private function deletePromptFragment($id) {
        $query = "DELETE FROM prompt_fragment WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);

        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception("Prompt fragment not found", 404);
        }
    }

    private function insertPromptFragmentTag($fragmentId, $tagId) {
        $query = "INSERT INTO prompt_fragment_tag (prompt_fragment_id, tag_id) VALUES (:fragment_id, :tag_id)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':fragment_id', $fragmentId, \PDO::PARAM_INT);
        $stmt->bindValue(':tag_id', $tagId, \PDO::PARAM_INT);
        $stmt->execute();
    }

    private function deletePromptFragmentTag($fragmentId, $tagId) {
        $query = "DELETE FROM prompt_fragment_tag WHERE prompt_fragment_id = :fragment_id AND tag_id = :tag_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':fragment_id', $fragmentId, \PDO::PARAM_INT);
        $stmt->bindValue(':tag_id', $tagId, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception("Tag or Prompt fragment not linked", 404);
        }
    }
}
