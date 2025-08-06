import React, { useState, useRef, useEffect } from "react";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MessageDisplayArea() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "user",
      content: "What can you tell me about quantum computing? ",
      timestamp: new Date(Date.now() - 10000),
    },
    {
      id: 2,
      type: "assistant",
      content:
        'Quantum computing is a revolutionary computing paradigm that leverages quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously.\n\nKey advantages include:\n• Exponential speedup for certain problems\n• Complex optimization capabilities\n• Cryptographic applications\n• Drug discovery and molecular modeling\n\nHowever, quantum computers are still in early stages, facing challenges like quantum decoherence, error rates, and the need for extremely cold operating temperatures.',
      timestamp: new Date(Date.now() - 5000),
    },
    {
      id: 3,
      type: "user",
      content: "How does quantum entanglement work?",
      timestamp: new Date(),
    },
    {
      id: 4,
      type: "assistant",
      content:
        "Quantum entanglement is one of the most fascinating phenomena in quantum physics. When two particles become entangled, they form a connected system where the quantum state of each particle cannot be described independently.\n\nHere's how it works:\n\n**Creation**: Entanglement typically occurs when particles interact or are created together in a way that their quantum states become correlated.\n\n**Instantaneous correlation**: Once entangled, measuring one particle instantly affects the other, regardless of the distance between them. Einstein famously called this \"spooky action at a distance.\"\n\n**Applications**:\n• Quantum cryptography for ultra-secure communication\n• Quantum teleportation of information\n• Enhanced precision in quantum sensors\n• Foundation for quantum computing algorithms\n\nIt's important to note that no information travels faster than light - rather, the particles share a quantum state that reveals correlated properties when measured.",
      timestamp: new Date(),
      isStreaming: true,
    },
  ]);

  const scrollAreaRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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
    <div className="flex-1 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div
                className={`flex gap-4 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[80%] ${
                    message.type === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                      )}
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
      </ScrollArea>
    </div>
  );
}
