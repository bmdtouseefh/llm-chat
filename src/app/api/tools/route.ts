import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { NextResponse } from "next/server";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import readline from "readline/promises";

class MCPClient {
  private mcp: Client;
  private tools: Tool[] = [];

  constructor() {
    this.mcp = new Client({ name: "mcp-client", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string) {
    const baseUrl = new URL("http://localhost:8050/sse");
    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }
      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;

      // this.transport = new StdioClientTransport({
      //   command,
      //   args: [serverScriptPath],
      // });
      // await this.mcp.connect(this.transport);
      const sseTransport = new SSEClientTransport(baseUrl);
      await this.mcp.connect(sseTransport);

      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });
      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async listTools() {
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      };
    });

    return this.tools;
  }

  async processQuery(query: string) {
    const messages: MessageParam[] = [
      {
        role: "user",
        content: query,
      },
    ];
    const requestBody: any = {
      model: "llama3.2:3b",
      messages: messages,
      stream: false,
      tools: this.tools,
    };

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const finalText = [];

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    return data;

    for (const content of data.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });

        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
        );

        messages.push({
          role: "user",
          content: result.content as string,
        });

        const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3.2:3b",
            messages: messages,
            stream: false,
          }),
        });

        const ollamaData = await ollamaResponse.json();

        // Extract text from Ollama response
        const responseText = ollamaData.message?.content || "";
        finalText.push(responseText);
      }
    }

    return finalText.join("\n");
  }

  async cleanup() {
    await this.mcp.close();
  }
}
const mcpClient = new MCPClient();
export async function GET() {
  try {
    await mcpClient.connectToServer("../mcps/simple-search/server.py");
    const tools = await mcpClient.listTools();
    return NextResponse.json(tools);
  } catch (e) {
    console.log("closing ", e);
    await mcpClient.cleanup();
    process.exit(0);
  }
}

export async function POST(query: string) {
  try {
    const tools = await mcpClient.processQuery(query);
    return NextResponse.json(tools);
  } catch (e) {
    console.log("closing ", e);
    await mcpClient.cleanup();
    process.exit(0);
  }
}

// main();
