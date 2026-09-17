import { callGeminiText } from "./gemini.service";
import { buildFinancialContextSummary } from "./financialContext.service";
import { AppError } from "../middlewares/errorHandler";

export async function askFundly(
  userId: string,
  question: string
): Promise<string> {
  const context = await buildFinancialContextSummary(userId);

  try {
    const answer = await callGeminiText({
      systemInstruction: `You are a financial assistant inside Fundly, a personal finance planning app. Answer the user's question using ONLY the financial data provided below — never invent numbers that aren't given. Be direct, concise (2-4 sentences typically), and practical. Do not give specific investment product recommendations or stock picks. If the data provided doesn't let you answer confidently, say so plainly rather than guessing.

User's financial data:
${context}`,
      prompt: question,
    });

    if (!answer) {
      throw new AppError(
        "Couldn't generate a response. Try rephrasing your question.",
        502
      );
    }

    return answer;
  } catch (err) {
    console.error("Ask Fundly failed:", err);

    if (err instanceof AppError) throw err;

    throw new AppError(
      "The financial assistant is temporarily unavailable. Please try again shortly.",
      502
    );
  }
}
