<?php

namespace DeepDiveAPI\resources;

use DeepDiveAPI\Resource;

class CompositePromptResource extends Resource {
    public function get() {
        return [
            'status' => 200,
            'data' => $this->getCompositePrompts(),
        ];
    }

    public function getById($id) {
        return [
            'status' => 200,
            'data' => $this->getCompositePrompt($id),
        ];
    }

    public function getByIdExpanded($id) {
        return [
            'status' => 200,
            'data' => $this->getExpandedCompositePrompt($id),
        ];
    }

    public function post() {
        $data = $this->getJsonData();

        if (empty($data['title']) || empty($data['author_id'])) {
            throw new \Exception("Title and author_id are required", 400);
        }

        $compositePromptId = $this->insertCompositePrompt($data);
        
        return [
            'status' => 201,
            'data' => $this->getCompositePrompt($compositePromptId),
        ];
    }

    public function put($id) {
        $data = $this->getJsonData();

        if (empty($data['title']) || empty($data['author_id'])) {
            throw new \Exception("Title and author_id are required", 400);
        }

        return [
            'status' => 200,
            'data' => $this->updateCompositePrompt($id, $data),
        ];
    }

    public function delete($id) {
        $this->deleteCompositePromptById($id);

        return [
            'status' => 204,
            'data' => null,
        ];
    }

    public function linkFragment($compositePromptId, $fragmentId) {
        $data = $this->getJsonData();

        if (!isset($data['order_index'])) {
            throw new \Exception("order_index is required", 400);
        }

        $this->insertCompositePromptFragment($compositePromptId, $fragmentId, $data['order_index']);
        return [ 'status' => 201 ];
    }

    public function unlinkFragment($compositePromptId, $fragmentId) {
        $this->deleteCompositePromptFragment($compositePromptId, $fragmentId);
        return [ 'status' => 204 ];
    }

    public function updateFragmentOrder($compositePromptId, $fragmentId) {
        $data = $this->getJsonData();

        if (!isset($data['order_index'])) {
            throw new \Exception("order_index is required", 400);
        }

        $this->updateCompositePromptFragmentOrder($compositePromptId, $fragmentId, $data['order_index']);
        return [ 'status' => 200 ];
    }

    // Private functions to handle database operations
    private function getCompositePrompts() {
        $query = "SELECT * FROM composite_prompt";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll();
        return $results;
    }

    private function getCompositePrompt($id) {
        $query = "SELECT * FROM composite_prompt WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch();

        if (!$result) {
            throw new \Exception('Composite prompt not found', 404);
        }

        return $result;
    }

    private function getExpandedCompositePrompt($id) {
        // Fetch fragments
        $queryFragments =
            "SELECT cppf.order_index, pf.* FROM composite_prompt_prompt_fragment cppf " .
            "JOIN prompt_fragment pf ON cppf.prompt_fragment_id = pf.id " .
            "WHERE cppf.composite_prompt_id = :id ORDER BY cppf.order_index";
        $stmtFragments = $this->pdo->prepare($queryFragments);
        $stmtFragments->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmtFragments->execute();
        $fragments = $stmtFragments->fetchAll();

        // Fetch result examples
        $queryResults = "SELECT * FROM result_example WHERE composite_prompt_id = :id";
        $stmtResults = $this->pdo->prepare($queryResults);
        $stmtResults->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmtResults->execute();
        $resultExamples = $stmtResults->fetchAll();

        // Fetch context files
        $queryContextFiles = "SELECT * FROM context_file WHERE composite_prompt_id = :id";
        $stmtContextFiles = $this->pdo->prepare($queryContextFiles);
        $stmtContextFiles->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmtContextFiles->execute();
        $contextFiles = $stmtContextFiles->fetchAll();

        $compositePrompt = $this->getCompositePrompt($id);

        return [
            ...$compositePrompt,
            'fragments' => $fragments,
            'result_examples' => $resultExamples,
            'context_files' => $contextFiles,
        ];
    }

    private function insertCompositePrompt($data) {
        $query = "INSERT INTO composite_prompt (author_id, title, description) VALUES (:author_id, :title, :description)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':author_id', $data['author_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':title', $data['title']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->execute();
        return $this->pdo->lastInsertId();
    }

    private function updateCompositePrompt($id, $data) {
        $query = "UPDATE composite_prompt SET author_id = :author_id, title = :title, description = :description WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->bindValue(':author_id', $data['author_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':title', $data['title']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->execute();

        return $this->getCompositePrompt($id);
    }

    private function deleteCompositePromptById($id) {
        $query = "DELETE FROM composite_prompt WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Composite prompt not found', 404);
        }
    }

    private function insertCompositePromptFragment($compositePromptId, $fragmentId, $orderIndex) {
        $query = "INSERT INTO composite_prompt_prompt_fragment (composite_prompt_id, prompt_fragment_id, order_index) VALUES (:composite_prompt_id, :fragment_id, :order_index)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':composite_prompt_id', $compositePromptId, \PDO::PARAM_INT);
        $stmt->bindValue(':fragment_id', $fragmentId, \PDO::PARAM_INT);
        $stmt->bindValue(':order_index', $orderIndex, \PDO::PARAM_INT);
        $stmt->execute();
    }

    private function deleteCompositePromptFragment($compositePromptId, $fragmentId) {
        $query = "DELETE FROM composite_prompt_prompt_fragment WHERE composite_prompt_id = :composite_prompt_id AND prompt_fragment_id = :fragment_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':composite_prompt_id', $compositePromptId, \PDO::PARAM_INT);
        $stmt->bindValue(':fragment_id', $fragmentId, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Fragment or Composite Prompt not linked', 404);
        }
    }

    private function updateCompositePromptFragmentOrder($compositePromptId, $fragmentId, $orderIndex) {
        $query = "UPDATE composite_prompt_prompt_fragment SET order_index = :order_index WHERE composite_prompt_id = :composite_prompt_id AND prompt_fragment_id = :fragment_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindValue(':composite_prompt_id', $compositePromptId, \PDO::PARAM_INT);
        $stmt->bindValue(':fragment_id', $fragmentId, \PDO::PARAM_INT);
        $stmt->bindValue(':order_index', $orderIndex, \PDO::PARAM_INT);
        $stmt->execute();
    }
}
