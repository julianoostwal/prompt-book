/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Select,
  SelectItem,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import api from "@/app/api";
import askai from "./openai";

export default function Home() {
  const [prompts, setPrompts] = useState<
    {
      author: { id: number; name: string; email: string };
      id: number;
      content: string;
      description: string;
      tags: { id: number; name: string }[];
    }[]
  >([]);
  const [allPrompts, setAllPrompts] = useState<
    {
      id: number;
      content: string;
      description: string;
      tags: { id: number; name: string }[];
      author: { id: number; name: string; email: string };
    }[]
  >([]);
  const [allTags, setAllTags] = useState<{ id: number; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: tagsIsOpen,
    onOpen: tagsOnOpen,
    onOpenChange: tagsChange,
    onClose: tagsClose,
  } = useDisclosure();
  const [newPrompt, setNewPrompt] = useState<{
    content: string;
    description: string;
    tags: number[];
  }>({
    content: "",
    description: "",
    tags: [],
  });

  const [newTag, setNewTag] = useState({
    id: 0,
    name: "",
  });
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [user, setUser] = useState({
    id: 0,
    name: "",
    email: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const BASE_URL = "http://ds0wow0o0o4cco048sko8sk8.5.253.247.243.sslip.io";

  const router = useRouter();

  const fetchUser = async () => {
    const response = await api.get(`${BASE_URL}/auth/status`).catch(() => {});
    if (response) setUser(response.data);
  };

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/prompt_fragments`);
      setPrompts(
        response.data.map((prompt: any) => ({
          ...prompt,
          tags: JSON.parse(prompt.tags),
          author: JSON.parse(prompt.author),
        }))
      );
      setAllPrompts(
        response.data.map((prompt: any) => ({
          ...prompt,
          tags: JSON.parse(prompt.tags),
          author: JSON.parse(prompt.author),
        }))
      );

      console.log(
        response.data.map((prompt: any) => ({
          ...prompt,
          tags: JSON.parse(prompt.tags),
          author: JSON.parse(prompt.author),
        }))
      );
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
      if (user && user.id !== 0) {
        const response = await api.post(`${BASE_URL}/prompt_fragments`, {
          content: newPrompt.content,
          description: newPrompt.description,
          author_id: user.id,
          tags: newPrompt.tags,
        });
        setPrompts([...prompts,
          {
            ...response.data,
            tags: JSON.parse(response.data.tags),
            author: JSON.parse(response.data.author),
          }]);
        setAllPrompts([...allPrompts, {
          ...response.data,
          tags: JSON.parse(response.data.tags),
          author: JSON.parse(response.data.author),
        }]);
        setNewPrompt({ content: "", description: "", tags: [] });
        onClose();
      } else {
        // setPrompts([
        //   ...prompts,
        //   {
        //     ...newPrompt,
        //     tags: [],
        //     id: 0,
        //     author: { id: 0, name: "", email: "" },
        //   },
        // ]);
        // setAllPrompts([
        //   ...allPrompts,
        //   {
        //     ...newPrompt,
        //     tags: [],
        //     id: 0,
        //     author: { id: 0, name: "", email: "" },
        //   },
        // ]);
        // setNewPrompt({ content: "", description: "", tags: [] });
        setError("Je bent niet ingelogd.");
        onClose();
      }
    } catch {
      setError("Er is een probleem met het toevoegen van de prompt.");
    }
  };
  const handleAddTagPrompt = async () => {
    try {
      if (user && user.id !== 0) {
        const response = await api.post(`${BASE_URL}/tags`, {
          name: newTag.name,
          author_id: user.id,
        });
        setTags([...tags, response.data]);
        setAllTags([...allTags, response.data]);
        setNewTag({ name: "", id: 0 });
        tagsClose();
      } else {
        setError("Je bent niet ingelogd.");
        router.push("/auth/login");
        tagsClose();
      }
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
    const filteredPrompts = allPrompts.filter((prompt) => prompt.tags.some((tag) => tag && tag.id === tagId)
    );
    setPrompts(filteredPrompts);
  };

  const resetFilter = () => {
    setPrompts(allPrompts);
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const description = `Create a ChatGPT prompt that instructs the AI to act as a ${newPrompt.description}. Ensure the prompt is clear, concise, and encourages engaging interactions.`;
      const response = await askai(description);

      setNewPrompt({ ...newPrompt, content: response || "" });
    } catch {
      setError("Er is een probleem met het genereren van de prompt content.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    fetchTags();
    fetchUser();
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
            <Button color="primary" onPress={tagsOnOpen}>
              Voeg nieuwe tag toe
            </Button>
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
                  <h4 className="font-bold text-primary">
                    @{prompt.author.name}
                  </h4>
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
                <div className="flex flex-col">
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
                </div>

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
                  <Button onClick={generateContent} disabled={isGenerating}>
                    {isGenerating
                      ? "Generating..."
                      : "Generate prompt content with AI"}
                  </Button>
                  <Textarea
                    label="Content"
                    value={newPrompt.content}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, content: e.target.value })
                    }
                  />
                  <Select
                    selectionMode="multiple"
                    onSelectionChange={(e) =>
                      setNewPrompt({
                        ...newPrompt,
                        tags: Array.from(e).map((key) => Number(key)),
                      })
                    }
                  >
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </Select>
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
        <Modal isOpen={tagsIsOpen} onOpenChange={tagsChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Maak nieuwe tag aan
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Tag Name"
                    value={newTag.name}
                    onChange={(e) =>
                      setNewTag({
                        ...newTag,
                        name: e.target.value,
                      })
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Sluiten
                  </Button>
                  <Button color="primary" onPress={handleAddTagPrompt}>
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
