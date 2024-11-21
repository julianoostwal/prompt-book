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
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import api from "../api";

const API_BASE_URL = "http://5.253.247.243:8000";

export default function Admin() {
  const [users, setUsers] = useState<
    {
      id: number;
      name: string;
      email: string;
      role: string;
      created_at: string;
      updated_at: string;
      last_login: string;
    }[]
  >([]);

  const { isOpen, onOpenChange } = useDisclosure();
  const { isOpen: userCreateOpen, onOpenChange: userCreateChange } =
    useDisclosure();
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState({
    id: 0,
    name: "",
    email: "",
    role: "",
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
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
      await api.delete(`${API_BASE_URL}/authors/${id}`);
      fetchUsers();
    } catch {
      setError("Er is een probleem met het verwijderen van de user.");
    }
  }

  async function handleEditUserSubmit(id: number) {
    console.log("Sending edit request for user:", editUser); // Log om te zien welke data wordt verstuurd
    try {
      await api.put(`${API_BASE_URL}/authors/${id}`, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
      });
      console.log("Edit request was successful"); // Log wanneer het verzoek succesvol is
      fetchUsers();
      onOpenChange(false);
    } catch (error) {
      console.error("Er is een probleem met het bewerken van de user:", error);
      setError("Er is een probleem met het bewerken van de user.");
    }
  }

  async function handleCreateUserSubmit() {
    try {
      await api.post(`${API_BASE_URL}/authors`, newUser);
      fetchUsers();
      userCreateChange(false);
      setNewUser({ name: "", email: "", role: "" });
    } catch {
      setError("Er is een probleem met het aanmaken van de user.");
    }
  }

  function openEditModal(user: (typeof users)[number]) {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
      <div className="flex justify-between mb-4">
        <h1 className="font-bold text-3xl">Admin</h1>
        <Button
          onPress={userCreateChange}
          className="uppercase btn bg-primary text-white"
        >
          Create new user
        </Button>
        <Modal
          isOpen={userCreateOpen}
          onOpenChange={userCreateChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Create new user
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Naam"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                  <Input
                    label="E-mail"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                  <Input
                  type="password"
                    label="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                  <Select
                    label="Chose a role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    {["user", "admin"].map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Sluiten
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      handleCreateUserSubmit();
                      onClose();
                    }}
                  >
                    Opslaan
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>

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
                Last login
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
                <td className="px-6 py-4">{user.last_login}</td>
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
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                  />
                  <Input
                    label="E-mail"
                    value={editUser.email}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                  />
                  <Select
                    label="Rol"
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                  >
                    {["user", "admin"].map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Sluiten
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      handleEditUserSubmit(editUser.id);
                    }}
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
