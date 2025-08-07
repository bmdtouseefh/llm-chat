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
    const ollamaTools = availableTools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    const requestBody: any = {
      model: "qwen3:1.7b",
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

    const data = await processQuery(requestBody);
    console.log("Data: ", data);

    // Extract tool calls from Ollama response if present
    // const toolsUsed = data.message.tool_calls
    //   ? data.message.tool_calls.map((call: any) => call.function.name)
    //   : determineToolsUsed(
    //       messages[messages.length - 1]?.content || "",
    //       availableTools
    //     );

    return NextResponse.json({
      content: data,
      // toolsUsed: toolsUsed,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
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

async function processQuery(requestBody: any) {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const finalText = [];

  if (!response.ok) {
    throw new Error("Ollama request failed ");
  }

  const data = await response.json();
  console.log(data);
  if (!data.message["tool_calls"]) {
    finalText.push(data.message.content);
  } else if (data.message.tool_calls) {
    // implement tool handling
  }

  return finalText.join("\n");
}
