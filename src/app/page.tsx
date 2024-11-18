"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
} from "@nextui-org/react";
import { motion } from "framer-motion";

// Basis URL van je API
const API_BASE_URL = "http://5.253.247.243:8000";

export default function Home() {
  const [prompts, setPrompts] = useState<
    { id: number; content: string; description: string }[]
  >([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    content: "",
    description: "",
  });

  // Functie om prompts op te halen
  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prompt_fragments`);
      setPrompts(response.data);
    } catch (err) {
      setError("Er is een probleem met het ophalen van de prompts.");
    }
  };

  // Functie om tags op te halen
  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tags`);
      setTags(response.data);
    } catch (err) {
      setError("Er is een probleem met het ophalen van de tags.");
    }
  };

  // Voeg een nieuwe prompt toe
  const handleAddPrompt = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/prompt_fragments`, {
        content: newPrompt.content,
        description: newPrompt.description,
      });
      setPrompts([...prompts, response.data]);
      setNewPrompt({ content: "", description: "" });
      handleModalClose();
    } catch (err) {
      setError("Er is een probleem met het toevoegen van de prompt.");
    }
  };

  // Verwijder een prompt
  const handleDeletePrompt = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/prompt_fragments/${id}`);
      setPrompts(prompts.filter((prompt) => prompt.id !== id));
    } catch (err) {
      setError("Er is een probleem met het verwijderen van de prompt.");
    }
  };

  // Sluit de modal
  const handleModalClose = () => setModalOpen(false);
  const handleModalOpen = () => setModalOpen(true);

  // Ophalen van prompts en tags bij het laden van de pagina
  useEffect(() => {
    fetchPrompts();
    fetchTags();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          De Fietsende Kip Premium ChatGPT Prompts
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Beschikbare ChatGPT Prompts
          </h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {prompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-semibold text-blue-500">
                  {prompt.description}
                </h3>
                <p className="text-gray-700 mt-2">{prompt.content}</p>
                <Button
                  size="sm"
                  color="warning"
                  className="mt-4"
                  onPress={() => handleDeletePrompt(prompt.id)}
                >
                  Verwijderen
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-4">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md"
              >
                {tag.name}
              </button>
            ))}
          </div>
        </section>

        <Button color="primary" onPress={handleModalOpen}>
          Voeg nieuwe prompt toe
        </Button>

        {/* Modal voor nieuwe prompt toevoegen */}
        <Modal isOpen={modalOpen} onClose={handleModalClose}>
          <ModalContent>
            <ModalHeader>Nieuwe Prompt Toevoegen</ModalHeader>
            <ModalBody>
              <Input
                isClearable
                placeholder="Beschrijving"
                value={newPrompt.description}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, description: e.target.value })
                }
              />
              <Textarea
                placeholder="Inhoud"
                value={newPrompt.content}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, content: e.target.value })
                }
                className="mt-4"
              />
            </ModalBody>
            <ModalFooter>
              <Button color="warning" onPress={handleModalClose}>
                Annuleren
              </Button>
              <Button color="primary" onPress={handleAddPrompt}>
                Toevoegen
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </main>
  );
}
