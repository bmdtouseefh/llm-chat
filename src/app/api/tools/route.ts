export async function GET() {
  const tools = [
    {
      id: "web_search",
      name: "Web Search",
      description: "Search the internet for current information",
    },
    {
      id: "image_generation",
      name: "Image Generation",
      description: "Generate images from text descriptions",
    },
    {
      id: "code_interpreter",
      name: "Code Interpreter",
      description: "Execute and analyze code",
    },
    {
      id: "file_reader",
      name: "File Reader",
      description: "Read and analyze uploaded files",
    },
    {
      id: "calculator",
      name: "Calculator",
      description: "Perform mathematical calculations",
    },
  ];

  return Response.json(tools);
}
