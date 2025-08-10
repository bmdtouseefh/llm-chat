import { NextRequest, NextResponse } from "next/server";
import { mcpClient } from "../tools/route";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Extract tools from the latest user message
    const latestUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop();

    const availableTools = await fetch("http://localhost:3000/api/tools/list", {
      method: "GET",
    });
    const toolList = await availableTools.json();
    // Format tools for Ollama (if your Ollama setup supports tools)

    const ollamaTools = toolList.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }));

    const requestBody: any = {
      model: "llama3.2:3b",
      messages: messages.map((msg: any) => ({
        role: msg.role,

        content: msg.content,
      })),
      stream: false,
      // think: true,
    };

    if (ollamaTools.length > 0) {
      requestBody.tools = ollamaTools;
    }

    console.log(requestBody);

    const data = await processQuery(requestBody);

    return NextResponse.json({
      content: data?.response,
      toolsUsed: data?.toolsUsed,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
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
    console.log("Ollama request failed ", await response.json());
  }

  const data = await response.json();

  requestBody.messages.push(data.message);

  if (!data.message["tool_calls"]) {
    console.log(data);

    requestBody.messages.push(data.message.content);
    finalText.push(data.message.content);
  } else if (data.message.tool_calls) {
    console.log(data);

    const toolsUsed = data.message.tool_calls.map(
      (call: any) => call.function.name
    );
    for (const tool of data.message.tool_calls) {
      console.log(tool);

      const toolName = tool.function.name;
      const toolArgs = tool.function.arguments;

      const result = await fetch("http://localhost:3000/api/tools/calltool", {
        body: JSON.stringify({ toolName: toolName, args: toolArgs }),
        method: "POST",
      });
      const toolResponse = await result.json();
      console.log(toolResponse);

      requestBody.messages.push({
        role: "tool",
        content: toolResponse,
      });
    }

    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const ollamaData = await ollamaResponse.json();

    const responseText = ollamaData.message?.content || "";
    finalText.push(responseText);

    return { response: finalText.join("\n"), toolsUsed: toolsUsed };
  }
  return { response: finalText.join("\n"), toolsUsed: null };
}
