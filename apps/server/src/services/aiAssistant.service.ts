import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";
import { buildFinancialContextSummary } from "./financialContext.service";
import { AppError } from "../middlewares/errorHandler";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function askFundly(userId: string, question: string): Promise<string> {
  const context = await buildFinancialContextSummary(userId);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: `You are a financial assistant inside Fundly, a personal finance planning app. Answer the user's question using ONLY the financial data provided below — never invent numbers that aren't given. Be direct, concise (2-4 sentences typically), and practical. Do not give specific investment product recommendations or stock picks. If the data provided doesn't let you answer confidently, say so plainly rather than guessing.

User's financial data:
${context}`,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new AppError("Couldn't generate a response. Try rephrasing your question.", 502);
    }

    return textBlock.text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("The financial assistant is temporarily unavailable. Please try again shortly.", 502);
  }
}