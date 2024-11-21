"use client";

import { use, useEffect, useState } from "react";
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
  useDisclosure,
} from "@nextui-org/react";
import { motion } from "framer-motion";

const API_BASE_URL = "http://5.253.247.243:8002";

export default function Admin() {
  const [users, setUsers] = useState<
    {
      id: number;
      name: string;
      email: string;
      role: string;
      created_at: string;
      updated_at: string;
    }[]
  >([]);

  const { isOpen, onOpenChange } = useDisclosure();
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState({
    id: 0, name: "", email: "", role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/authors`);
      setUsers(response.data);
      console.log(response.data);
    } catch {
      setError("Er is een probleem met het ophalen van de users.");
    }
  }

  async function handleDeleteUser(id: number) {
    try {
      await axios.delete(`${API_BASE_URL}/authors/${id}`);
      fetchUsers();
    } catch {
      setError("Er is een probleem met het verwijderen van de user.");
    }
  }

  async function handleEditUserSubmit(id: number) {
    try {
      await axios.put(`${API_BASE_URL}/authors/${id}`, editUser);
      fetchUsers();
      onOpenChange(false);
    } catch {
      setError("Er is een probleem met het bewerken van de user.");
    }
  }

  function openEditModal(user: (typeof users)[number]) {
    setEditUser({
      id: user.id, name: user.name, email: user.email, role: user.role,
    });
    onOpenChange(true);
  }

  return (
    <main className="container min-h-screen mx-auto">
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
      <h1 className="font-bold text-3xl">Admin</h1>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Created at
              </th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {user.name}
                </th>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.created_at}</td>
                <td>
                  <Button
                    onClick={() => openEditModal(user)}
                    className="btn bg-primary text-white"
                  >
                    Edit
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn bg-danger text-white"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Bewerk gebruiker
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Naam"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })
                    }
                  />
                  <Input
                    label="E-mail"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })
                    }
                  />
                  <Input
                    label="Rol"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Sluiten
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleEditUserSubmit(editUser.id)}
                    onPress={onClose}
                  >
                    Opslaan
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </main>
  );
}
