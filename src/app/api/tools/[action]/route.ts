import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { NextRequest, NextResponse } from "next/server";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import readline from "readline/promises";

export class MCPClient {
  private mcp: Client;
  private tools: Tool[] = [];

  constructor() {
    this.mcp = new Client({ name: "mcp-client", version: "1.0.0" });
  }

  async connectToServer() {
    const baseUrl = new URL("http://localhost:8050/sse");
    try {
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
        "Connected to the server from with tools:",
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

  async toolCaller(toolName, args): Promise<any> {
    const mcp_result = await this.mcp.callTool({
      name: toolName,
      arguments: args,
    });
    const tool_output = mcp_result.content[0].text;
    return tool_output;
  }

  async cleanup() {
    await this.mcp.close();
  }
}
export const mcpClient = new MCPClient();
export async function GET(request: NextRequest, { params }) {
  const { action } = await params;
  if (action === "list") {
    try {
      await mcpClient.connectToServer();
      const tools = await mcpClient.listTools();
      mcpClient.cleanup();
      return NextResponse.json(tools);
    } catch (e) {
      console.log("closing ", e);
      await mcpClient.cleanup();
      process.exit(0);
    }
  }
  return NextResponse.json({ status: 400, details: "invalid url" });
}

export async function POST(request: NextRequest, { params }) {
  const { action } = await params;
  switch (action) {
    case "fetch":
      console.log("calling fetch");
      break;
    case "calltool":
      try {
        const data = await request.json();
        await mcpClient.connectToServer();

        const res = await mcpClient.toolCaller(data.toolName, data.args);
        mcpClient.cleanup();
        return NextResponse.json(res);
        break;
      } catch (e) {
        console.log("Errored:", e);
      }
    default:
      return NextResponse.json({ status: 400, details: "invalid url" });
      break;
  }
}
