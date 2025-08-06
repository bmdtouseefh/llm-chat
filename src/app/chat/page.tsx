"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageDisplayArea from "@/components/uiCustom/AreaMessages";
import ChatInput from "@/components/uiCustom/Chatinput";
import { FormEvent, useState } from "react";

const Chat = () => {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  const handleChat = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/ollama", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setReply(data.response);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <ChatInput></ChatInput>
    </div>
  );
};

export default Chat;
