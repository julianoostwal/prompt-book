"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import api from '@/app/api';
import axios from "axios";

export default function Home() {
  const [prompts, setPrompts] = useState<
    { id: number; content: string; description: string; tags: number[] }[]
  >([]);
  const [allPrompts, setAllPrompts] = useState<
    { id: number; content: string; description: string; tags: number[] }[]
  >([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [newPrompt, setNewPrompt] = useState({
    content: "",
    description: "",
  });
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const BASE_URL = "http://5.253.247.243:8000";
  
  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/prompt_fragments`);
      setPrompts(response.data);
      setAllPrompts(response.data);
    } catch {
      setError("Er is een probleem met het ophalen van de prompts.");
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tags`);
      setTags(response.data);
    } catch {
      setError("Er is een probleem met het ophalen van de tags.");
    }
  };

  const handleAddPrompt = async () => {
    try {
      const response = await api.post(`${BASE_URL}/prompt_fragments`, {
        content: newPrompt.content,
        description: newPrompt.description,
        author_id: 1,
      });
      setPrompts([...prompts, response.data]);
      setAllPrompts([...allPrompts, response.data]);
      setNewPrompt({ content: "", description: "" });
      onClose();
    } catch {
      setError("Er is een probleem met het toevoegen van de prompt.");
    }
  };

  const handleDeletePrompt = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/prompt_fragments/${id}`);
      setPrompts(prompts.filter((prompt) => prompt.id !== id));
      setAllPrompts(allPrompts.filter((prompt) => prompt.id !== id));
    } catch {
      setError("Er is een probleem met het verwijderen van de prompt.");
    }
  };

  const handleEditPrompt = async (id: number) => {
    try {
      setPrompts(
        prompts.map((prompt) =>
          prompt.id === id ? { ...prompt, content: editingContent } : prompt
        )
      );
      setEditingPromptId(null);
      setEditingContent("");
    } catch {
      setError("Er is een probleem met het bewerken van de prompt.");
    }
  };

  const filterPromptsByTag = (tagId: number) => {
    setSelectedTag(tagId);
    const filteredPrompts = allPrompts.filter((prompt) =>
      prompt.tags.includes(tagId)
    );
    setPrompts(filteredPrompts);
  };

  const resetFilter = () => {
    setSelectedTag(null);
    setPrompts(allPrompts);
  };

  useEffect(() => {
    fetchPrompts();
    fetchTags();
  }, []);

  return (
    <motion.main
      className="min-h-screen bg-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.h1
          className="text-3xl font-bold text-center text-blue-600 mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          De Fietsende Kip Premium ChatGPT Prompts
        </motion.h1>
        {error && (
          <motion.div
            className="bg-red-500 text-white p-4 rounded-md mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p>{error}</p>
          </motion.div>
        )}
        <section className="mb-6">
          <motion.div
            className="flex justify-between flex-wrap gap-4"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Beschikbare ChatGPT Prompts
            </h2>
            <Button color="primary" onPress={onOpen}>
              Voeg nieuwe prompt toe
            </Button>
          </motion.div>
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-4">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => filterPromptsByTag(tag.id)}
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  {tag.name}
                </button>
              ))}
              <button
                onClick={resetFilter}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Toon Alle
              </button>
            </div>
          </section>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {prompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div>
                  <h3 className="text-xl font-semibold text-blue-500">
                    {prompt.description}
                  </h3>
                  {editingPromptId === prompt.id ? (
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onBlur={() => handleEditPrompt(prompt.id)}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-gray-700 mt-2 w-full"
                      onClick={() => {
                        setEditingPromptId(prompt.id);
                        setEditingContent(prompt.content);
                      }}
                    >
                      {prompt.content}
                    </p>
                  )}
                </div>
                <Button size="sm" color="primary" className="mt-4">
                  <a
                    target="_blank"
                    href={`https://chatgpt.com/?q=${encodeURIComponent(
                      prompt.content
                    )}`}
                  >
                    Open with ChatGPT
                  </a>
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  className="mt-4"
                  onPress={() => handleDeletePrompt(prompt.id)}
                >
                  Verwijderen
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </section>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Maak nieuwe prompt aan
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Description"
                    value={newPrompt.description}
                    onChange={(e) =>
                      setNewPrompt({
                        ...newPrompt,
                        description: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    label="Content"
                    value={newPrompt.content}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, content: e.target.value })
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Sluiten
                  </Button>
                  <Button color="primary" onPress={handleAddPrompt}>
                    Opslaan
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </motion.main>
  );
}
