import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log(data);

    return NextResponse.json({ response: `Here is the ${data}` });
  } catch (e) {
    console.error("Error: ", e);
  }
}
