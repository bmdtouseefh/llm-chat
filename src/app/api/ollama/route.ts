import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:1.7b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      }),
    });
    const data = await res.json();

    return NextResponse.json({ response: data.message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to call Ollama" },
      { status: 500 }
    );
  }
}
