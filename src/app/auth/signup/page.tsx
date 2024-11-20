"use client";
import { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import api from '@/app/api';
import { useRouter } from "next/navigation";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSignup = async () => {
        try {
            await api.post("/authors", {
                name,
                email,
                password,
            });

            router.push("/auth/login");
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    return (
        <main className="min-h-screen container mx-auto">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    Fietsende K.I.P    
                </a>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Create an account
                        </h1>
                        <form className="space-y-4 md:space-y-6" action={handleSignup}>
                            <div>
                                <Input isRequired value={name} label="Name" onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div>
                                <Input isRequired value={email} label="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <Input isRequired value={password} label="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={handleSignup}>
                                Sign Up
                            </Button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Already have an account? <a href="/auth/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}