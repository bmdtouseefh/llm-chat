import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Wrench,
  Mic,
  ArrowUp,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatbotLayout() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "user",
      content: "What can you tell me about quantum computing?",
      timestamp: new Date(Date.now() - 10000),
    },
    {
      id: 2,
      type: "assistant",
      content:
        'Quantum computing is a revolutionary computing paradigm that leverages quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously.\n\nKey advantages include:\n• Exponential speedup for certain problems\n• Complex optimization capabilities\n• Cryptographic applications\n• Drug discovery and molecular modeling\n\nHowever, quantum computers are still in early stages, facing challenges like quantum decoherence, error rates, and the need for extremely cold operating temperatures.',
      timestamp: new Date(Date.now() - 5000),
    },
  ]);

  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleAddClick = () => {
    console.log("Add function is active");
  };

  const handleToolsClick = () => {
    console.log("Tools function is active");
  };

  const handleMicClick = () => {
    console.log("Microphone function is active");
  };

  const handleSubmit = () => {
    console.log("Submit function is active");
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: "user",
        content: inputValue,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    console.log("Content copied to clipboard");
  };

  const handleThumbsUp = (messageId) => {
    console.log(`Thumbs up for message ${messageId}`);
  };

  const handleThumbsDown = (messageId) => {
    console.log(`Thumbs down for message ${messageId}`);
  };

  const handleRegenerate = (messageId) => {
    console.log(`Regenerating message ${messageId}`);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      {messages.length === 0 && (
        <div className="flex-shrink-0 flex items-center justify-center pt-20">
          <h1 className="text-white text-4xl font-medium">
            What can I help with?
          </h1>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div
                    className={`flex gap-4 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex flex-col max-w-[80%] ${
                        message.type === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.type === "user"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-800 text-gray-100 border border-gray-700"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{formatTime(message.timestamp)}</span>

                        {message.type === "assistant" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(message.content)}
                              className="h-6 px-2 hover:bg-gray-700"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleThumbsUp(message.id)}
                              className="h-6 px-2 hover:bg-gray-700"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleThumbsDown(message.id)}
                              className="h-6 px-2 hover:bg-gray-700"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRegenerate(message.id)}
                              className="h-6 px-2 hover:bg-gray-700"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.type === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-3xl border border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddClick}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 mt-1"
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToolsClick}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 mt-1"
              >
                <Wrench className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Tools</span>
              </Button>

              <Textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 240) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="flex-1 bg-transparent h-auto text-white placeholder-gray-500 border-none outline-none resize-none min-h-[40px] focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleMicClick}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 mt-1"
              >
                <Mic className="w-5 h-5 text-gray-400" />
              </Button>

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors disabled:bg-gray-700 disabled:opacity-50 flex-shrink-0 mt-1"
              >
                <ArrowUp className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
