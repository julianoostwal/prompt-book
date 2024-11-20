"use client";
import { FormEvent, useState } from "react";
import { Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthContext";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import api from "@/app/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    
    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            login(response.data.token);
            router.push("/");
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                setError(error.response?.data?.message || "Login failed. Please try again.");
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <main className="min-h-screen container mx-auto">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    Fietsende K.I.P
                </div>
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
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                            <div>
                                <Input
                                    isRequired
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <Input
                                    isRequired
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            >
                                Sign in
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don&apos;t have an account yet? <a href="/auth/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
