"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://5.253.247.243:8000";

export default function App() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    last_login: string;
  }>({
    id: 0,
    name: "",
    email: "",
    role: "",
    created_at: "",
    updated_at: "",
    last_login: "",
  });

  useEffect(() => {
    async function fetchCurrentUser() {
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch {
        logout();
      }
    }

    fetchCurrentUser();
  }, [token, logout]);

  return (
    <Navbar>
      <NavbarBrand>
        <Link href="/">
          <p className="font-bold text-inherit">Fietsende K.I.P</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="primary" href="/ai">
            ChatGPT Prompt
          </Link>
        </NavbarItem>
        {user.role === "admin" && (
          <NavbarItem>
            <Link color="primary" href="/admin">
              Admin
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>
      <NavbarContent justify="end">
        {token ? (
          <NavbarItem>
            <Button onClick={logout} color="danger" variant="flat">
              Logout
            </Button>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="/auth/login">Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" href="/auth/signup" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}
