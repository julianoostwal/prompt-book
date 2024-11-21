"use client";

import { Button, Input } from "@nextui-org/react";
import askai from "../openai";
import { useState } from "react";
import Typewriter from 'typewriter-effect';
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function Ai() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function ai1() {
    const response = await askai(question);
    setAnswer(response || "");
    setQuestion("");

  }

  function handleKeyDown(event: { key: string; }) {
    if (event.key === "Enter") {
      ai1();
    }
  }

  return (
    <main className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center p-4">
      <div className="text-3xl font-bold mb-8">
        <Typewriter
          options={{
            strings: ["Ask me anything!", "I'm here to help!"],
            autoStart: true,
            loop: true,
          }}
        />
      </div>
      <div className="w-full max-w-md">
        <Input
          className="w-full mb-4 border border-gray-700"
          type="text"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-4" onClick={() => ai1()}>
          Ask
        </Button>
        {answer && (
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-md">
            <TextGenerateEffect duration={1} filter={false} words={answer} />
          </div>
        )}
      </div>
    </main>
  );
}