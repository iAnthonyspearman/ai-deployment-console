import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "OPENAI_API_KEY is not configured. Add it to .env.local and restart the local server.",
      });
    }

    const { request, mode, history } = req.body || {};

    const userRequest =
      request ||
      "Create an AI deployment brief for a business that wants to use AI to improve operations.";

    const selectedMode = mode || "Business";

    const openai = new OpenAI({
      apiKey,
    });

    const systemPrompt = `
You are an AI Deployment Console assistant for Anthony Spearman's portfolio.

Your job is to turn a business, coding, or strategy request into a clean AI deployment brief.

Always respond with these sections:

1. Problem
2. AI Solution
3. Deployment Plan
4. Workflow / Architecture
5. Risks and Guardrails
6. Recommended Next Steps

Keep the response practical, recruiter-friendly, and business-focused.
Use clear language. Do not overcomplicate the answer.
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...(Array.isArray(history) ? history.slice(-6) : []),
        {
          role: "user",
          content: `Mode: ${selectedMode}\nRequest: ${userRequest}`,
        },
      ],
      temperature: 0.65,
      max_tokens: 900,
    });

    const output =
      response.choices?.[0]?.message?.content ||
      "The AI deployment assistant received the request but did not return an answer.";

    return res.status(200).json({
      output,
      mode: selectedMode,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
  } catch (error) {
    console.error("Local AI deployment console error:", error);

    const message =
      error?.status === 401
        ? "OpenAI authentication failed. Check that OPENAI_API_KEY is correct in .env.local."
        : error?.status === 429
        ? "OpenAI quota or rate limit issue. Check billing, credits, or usage limits."
        : error?.message ||
          "The local AI service could not complete the request. Check your API key and model.";

    return res.status(error?.status || 500).json({
      error: message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Deployment Console local server running on http://localhost:${PORT}`);
});
