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
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { v4 as uuidv4 } from "uuid";

export default function ChatbotLayout() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState([]);
  const [enabledTools, setEnabledTools] = useState(new Set());

  const scrollAreaRef = useRef(null);

  // Fetch available tools on component mount
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch("/api/tools");
        if (response.ok) {
          const toolsData = await response.json();
          setTools(toolsData);
        }
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      }
    };

    fetchTools();
  }, []);

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
    console.log("Tools dropdown opened");
  };

  const toggleTool = (toolId) => {
    setEnabledTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
        console.log(`Tool ${toolId} disabled`);
      } else {
        newSet.add(toolId);
        console.log(`Tool ${toolId} enabled`);
      }
      return newSet;
    });
  };

  const handleMicClick = () => {
    console.log("Microphone function is active");
  };

  const handleSubmit = async () => {
    console.log("Submit function is active");
    if (inputValue.trim() && !isLoading) {
      const userMessage = {
        id: uuidv4(),
        type: "user",
        content: inputValue,
        timestamp: new Date(),
        tools: Array.from(enabledTools),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInputValue("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages.map((msg) => ({
              role: msg.type === "user" ? "user" : "assistant",
              content: msg.content,
              tools: msg.tools || [],
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMessage = {
            id: uuidv4(),
            type: "assistant",
            content: data.content,
            timestamp: new Date(),
            toolsUsed: data.toolsUsed || [],
          };
          setMessages([...newMessages, assistantMessage]);
        } else {
          throw new Error("Failed to get response");
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = {
          id: uuidv4(),
          type: "assistant",
          content: "Sorry, I encountered an error connecting to the server.",
          timestamp: new Date(),
        };
        setMessages([...newMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
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
                        </div>
                      </div>
                      {/* Show tools used for assistant messages */}
                      {message.type === "assistant" &&
                        message.toolsUsed &&
                        message.toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.toolsUsed.map((toolId) => {
                              const tool = tools.find((t) => t.id === toolId);
                              return tool ? (
                                <span
                                  key={toolId}
                                  className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30"
                                >
                                  {tool.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}

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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToolsClick}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 mt-1"
                  >
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">Tools</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700">
                  {tools.length === 0 ? (
                    <DropdownMenuItem disabled className="text-gray-500">
                      No tools available
                    </DropdownMenuItem>
                  ) : (
                    tools.map((tool) => (
                      <DropdownMenuItem
                        key={tool.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-700 focus:bg-gray-700"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">
                            {tool.name}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {tool.description}
                          </span>
                        </div>
                        <Switch
                          checked={enabledTools.has(tool.id)}
                          onCheckedChange={() => toggleTool(tool.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="flex-1 bg-transparent text-white placeholder-gray-500 border-none outline-none resize-none min-h-[40px] max-h-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors disabled:bg-gray-700 disabled:opacity-50 flex-shrink-0 mt-1"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
