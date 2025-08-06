"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

const initialMessages = [
  { id: 1, text: "Hello there! This is a simple chat app.", sender: "bot" },
  { id: 2, text: "I'm a user, and this is my message.", sender: "user" },
  { id: 3, text: "Welcome to the conversation!", sender: "bot" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() !== "") {
      const newMessage = {
        id: messages.length + 1,
        text: input,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-sans">
      <div className="bg-gray-900 mx-48  rounded-xl border items-center border-gray-800 w-full  min-h-screen flex flex-col">
        {/* header */}
        <div className="border-b p-4 border-gray-800 ">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
            Chat App
          </h1>
        </div>
        {/* messages display */}
        <div className="flex-1   w-full border border-y-2 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                  message.sender === "user"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex items-center border-t p-4 border-gray-800 gap-2"
        >
          <Input
            placeholder="Type here"
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-orange-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button>Send</Button>
        </form>
      </div>
    </div>
  );
}
