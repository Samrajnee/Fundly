import { GoogleGenerativeAI, SchemaType, FunctionDeclarationSchema } from "@google/generative-ai";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export { SchemaType };

export async function callGeminiTool<T = Record<string, unknown>>(params: {
  prompt: string;
  functionName: string;
  functionDescription: string;
  schema: FunctionDeclarationSchema;
}): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [
      {
        functionDeclarations: [
          {
            name: params.functionName,
            description: params.functionDescription,
            parameters: params.schema,
          },
        ],
      },
    ],
    toolConfig: {
      functionCallingConfig: {
        mode: "ANY" as never,
        allowedFunctionNames: [params.functionName],
      },
    },
  });

  const result = await model.generateContent(params.prompt);
  const calls = result.response.functionCalls();

  if (!calls || calls.length === 0) {
    throw new Error("Gemini did not return a function call");
  }

  return calls[0].args as T;
}

export async function callGeminiText(params: { systemInstruction?: string; prompt: string }): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",    
    systemInstruction: params.systemInstruction,
  });

  const result = await model.generateContent(params.prompt);
  return result.response.text();
}