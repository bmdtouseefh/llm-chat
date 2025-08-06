import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Extract tools from the latest user message
    const latestUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop();

    const availableTools = latestUserMessage?.tools || [];

    // Format tools for Ollama (if your Ollama setup supports tools)
    const ollamaTools = availableTools.map((toolId: string) => ({
      type: "function",
      function: {
        name: toolId,
        description: getToolDescription(toolId),
      },
    }));

    const requestBody: any = {
      model: "llama3.2:3b",
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: false,
    };

    // Add tools to request if available
    if (ollamaTools.length > 0) {
      requestBody.tools = ollamaTools;
    }

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    // Extract tool calls from Ollama response if present
    const toolsUsed = data.message.tool_calls
      ? data.message.tool_calls.map((call: any) => call.function.name)
      : determineToolsUsed(
          messages[messages.length - 1]?.content || "",
          availableTools
        );

    return NextResponse.json({
      content: data.message.content,
      toolsUsed: toolsUsed,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

// Helper function to get tool descriptions
function getToolDescription(toolId: string): string {
  const descriptions: { [key: string]: string } = {
    web_search: "Search the internet for current information",
    image_generation: "Generate images from text descriptions",
    code_interpreter: "Execute and analyze code",
    file_reader: "Read and analyze uploaded files",
    calculator: "Perform mathematical calculations",
  };

  return descriptions[toolId] || "A helpful tool";
}

// Fallback function if Ollama doesn't return tool calls
function determineToolsUsed(
  content: string,
  availableTools: string[]
): string[] {
  const usedTools: string[] = [];
  const lowerContent = content.toLowerCase();

  if (
    availableTools.includes("web_search") &&
    (lowerContent.includes("search") ||
      lowerContent.includes("latest") ||
      lowerContent.includes("current"))
  ) {
    usedTools.push("web_search");
  }

  if (
    availableTools.includes("calculator") &&
    (lowerContent.includes("calculate") ||
      lowerContent.includes("math") ||
      /\d+[\+\-\*\/]\d+/.test(lowerContent))
  ) {
    usedTools.push("calculator");
  }

  if (
    availableTools.includes("code_interpreter") &&
    (lowerContent.includes("code") ||
      lowerContent.includes("python") ||
      lowerContent.includes("javascript"))
  ) {
    usedTools.push("code_interpreter");
  }

  if (
    availableTools.includes("image_generation") &&
    (lowerContent.includes("image") ||
      lowerContent.includes("picture") ||
      lowerContent.includes("generate"))
  ) {
    usedTools.push("image_generation");
  }

  return usedTools;
}
