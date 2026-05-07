import OpenAI from "openai";

const fallbackBrief = {
  problemUnderstanding:
    "The request needs to be translated into a clear business or technical problem before deployment. The system should identify the goal, the user, the workflow gap, and the desired outcome.",
  businessImpact:
    "A stronger AI workflow can reduce manual effort, improve response time, organize decisions, and create a repeatable process that helps teams move faster.",
  aiSolution:
    "Use an AI assistant to interpret the request, summarize the need, recommend an action plan, and produce structured next steps that can be used by a business or technical team.",
  deploymentPlan: [
    "Capture the user request.",
    "Classify the request as business, coding, or strategy.",
    "Generate a structured deployment brief.",
    "Review the AI output before acting on it.",
    "Turn the recommendation into tasks, documentation, or implementation steps.",
  ],
  workflowArchitecture:
    "User Prompt → API Route → OpenAI Model → Structured JSON Brief → Frontend Dashboard → Human Review / Next Action",
  risksAndGuardrails: [
    "Do not expose private API keys.",
    "Do not automate high-impact decisions without human review.",
    "Validate technical recommendations before production use.",
    "Keep customer or business data protected.",
  ],
  nextSteps: [
    "Clarify the desired outcome.",
    "Identify the system or workflow involved.",
    "Choose the first small action to automate or improve.",
    "Test the AI recommendation with a real use case.",
  ],
};

function normalizeBrief(value) {
  if (!value || typeof value !== "object") {
    return fallbackBrief;
  }

  return {
    problemUnderstanding:
      value.problemUnderstanding ||
      value.problem ||
      value.problem_understanding ||
      fallbackBrief.problemUnderstanding,

    businessImpact:
      value.businessImpact ||
      value.business_impact ||
      value.impact ||
      fallbackBrief.businessImpact,

    aiSolution:
      value.aiSolution ||
      value.solution ||
      value.ai_solution ||
      fallbackBrief.aiSolution,

    deploymentPlan: Array.isArray(value.deploymentPlan)
      ? value.deploymentPlan
      : Array.isArray(value.deployment_plan)
      ? value.deployment_plan
      : Array.isArray(value.steps)
      ? value.steps
      : fallbackBrief.deploymentPlan,

    workflowArchitecture:
      value.workflowArchitecture ||
      value.workflow ||
      value.architecture ||
      value.workflow_architecture ||
      fallbackBrief.workflowArchitecture,

    risksAndGuardrails: Array.isArray(value.risksAndGuardrails)
      ? value.risksAndGuardrails
      : Array.isArray(value.risks)
      ? value.risks
      : Array.isArray(value.guardrails)
      ? value.guardrails
      : fallbackBrief.risksAndGuardrails,

    nextSteps: Array.isArray(value.nextSteps)
      ? value.nextSteps
      : Array.isArray(value.next_steps)
      ? value.next_steps
      : Array.isArray(value.recommendedNextSteps)
      ? value.recommendedNextSteps
      : fallbackBrief.nextSteps,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      brief: fallbackBrief,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        brief: fallbackBrief,
        error:
          "OPENAI_API_KEY is not configured. Add it to Vercel Environment Variables and redeploy.",
      });
    }

    const { request, prompt, message, mode, history } = req.body || {};

    const userRequest =
      request ||
      prompt ||
      message ||
      "Create an AI deployment brief for a business that wants to use AI to improve operations.";

    const selectedMode = mode || "Business";

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `
You are the AI Deployment Console assistant for Anthony Spearman's portfolio.

The user may type ANYTHING: a business idea, coding request, strategy question, vague thought, job-related prompt, or incomplete sentence.

Your job is to always return a valid JSON object only.

Return exactly this JSON shape:
{
  "problemUnderstanding": "string",
  "businessImpact": "string",
  "aiSolution": "string",
  "deploymentPlan": ["string", "string", "string"],
  "workflowArchitecture": "string",
  "risksAndGuardrails": ["string", "string", "string"],
  "nextSteps": ["string", "string", "string"]
}

Rules:
- Do not return markdown.
- Do not wrap the JSON in code fences.
- Do not include extra commentary outside JSON.
- If the prompt is vague, infer a reasonable business/technical use case.
- Keep the answer practical, recruiter-friendly, and focused on real AI deployment.
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(Array.isArray(history) ? history.slice(-6) : []),
        {
          role: "user",
          content: `Mode: ${selectedMode}\nUser request: ${userRequest}`,
        },
      ],
      temperature: 0.55,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });

    const raw =
      response.choices?.[0]?.message?.content ||
      JSON.stringify(fallbackBrief);

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = fallbackBrief;
    }

    const brief = normalizeBrief(parsed);

    return res.status(200).json({
      brief,
      output: brief,
      mode: selectedMode,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
  } catch (error) {
    console.error("AI deployment console API error:", error);

    const message =
      error?.status === 401
        ? "OpenAI authentication failed. Check OPENAI_API_KEY in Vercel."
        : error?.status === 429
        ? "OpenAI quota or rate limit issue. Check billing, credits, or usage limits."
        : error?.message ||
          "The AI service could not complete the request.";

    return res.status(error?.status || 500).json({
      brief: fallbackBrief,
      output: fallbackBrief,
      error: message,
    });
  }
}
