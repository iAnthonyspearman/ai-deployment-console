import OpenAI from "openai";

const fallbackBrief = {
  problemUnderstanding:
    "The request needs to be translated into a clear business or technical problem before deployment. The system should identify the goal, the user, the workflow gap, and the desired outcome.",
  businessImpact:
    "A stronger AI workflow can reduce manual effort, improve response time, organize decisions, and create a repeatable process that helps teams move faster.",
  aiSolution:
    "Use an AI assistant to interpret the request, summarize the need, recommend an action plan, and produce structured next steps that can be used by a business or technical team.",
  technicalImplementation:
    "Build a frontend form that sends the request and selected mode to a protected API route. The backend calls OpenAI, validates the response, normalizes the JSON structure, and returns safe fields for the dashboard to render.",
  pseudocode:
    "function generateBrief(prompt, mode):\n  if prompt is empty: show validation error\n  send { prompt, mode } to /api/ask\n  API selects mode-specific system prompt\n  OpenAI returns structured JSON\n  normalize missing fields\n  render deployment cards\n  catch errors and show fallback brief",
  deploymentPlan: [
    "Capture the user request.",
    "Classify the request as business, coding, or strategy.",
    "Generate a structured deployment brief.",
    "Review the AI output before acting on it.",
    "Turn the recommendation into tasks, documentation, or implementation steps.",
  ],
  stepByStepPlan: [
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

const modePrompts = {
  Business: `
You are in BUSINESS mode.

The output must ONLY be a business deployment brief.
Do not include code, pseudocode, file names, API files, or developer implementation details.

No matter what the user types, convert the request into a business-focused AI deployment brief.

Required behavior:
- Focus on the business problem, workflow gap, customer impact, revenue impact, operations, CRM/process improvement, staffing impact, and measurable business value.
- Do NOT provide code.
- Keep the deploymentPlan business-operational.
- Keep workflowArchitecture written as a business system flow, not technical code.
- Make it sound like an AI Solutions Analyst explaining value to a company.
`,
  Coding: `
You are in CODING mode.

The output must ONLY be a coding / engineering implementation brief.
No matter what the user types, convert the request into a technical build brief.

Required:
- Include code-oriented thinking.
- Include pseudocode in the pseudocode field.
- Include technicalImplementation.
- Mention the frontend, API route, request payload, JSON response schema, validation, error handling, and environment variables where relevant.
- The stepByStepPlan must read like a developer implementation sequence.

Required behavior:
- The aiSolution MUST mention the technical implementation approach.
- The deploymentPlan and stepByStepPlan MUST include implementation steps.
- The workflowArchitecture MUST describe frontend, API route, model call, data shape, rendering, validation, and deployment.
- The technicalImplementation field MUST explain how to build it using frontend, backend/API route, request body, response schema, validation, error handling, environment variables, and deployment.
- The pseudocode field MUST contain actual pseudocode written as plain text with multiple lines.
- The workflowArchitecture field MUST mention frontend input, API endpoint, OpenAI call, JSON response, and UI rendering.
- Mention likely files/components such as public/app.js, public/index.html, api/ask.js, request body, response schema, and environment variables when useful.
- This mode should feel like a developer build plan, not a general business answer.
`,
  Strategy: `
You are in STRATEGY mode.

The output must ONLY be an executive strategy / rollout brief.
Do not include code or pseudocode.
No matter what the user types, convert the request into an executive strategy brief.

Required:
- Focus on stakeholders, adoption, rollout phases, training, governance, risk, cost control, KPIs, and leadership decisions.
- The stepByStepPlan must read like a strategic rollout roadmap.

Required behavior:
- Focus on rollout strategy, stakeholders, adoption, governance, change management, cost control, risk, training, success metrics, and phased implementation.
- Do NOT provide code.
- The deploymentPlan and stepByStepPlan MUST be strategic phases.
- The workflowArchitecture should describe leadership/process flow, not technical implementation.
- Make it sound like an AI Strategy / Solutions Consultant advising leadership.
`,
};


function modeFallbackBrief(mode) {
  if (mode === "Coding") {
    return {
      ...modeFallbackBrief(selectedMode),
      problemUnderstanding:
        "The request should be converted into a technical build problem with clear frontend behavior, backend API responsibilities, data shape, and deployment requirements.",
      businessImpact:
        "A reliable implementation improves delivery speed, reduces manual work, and creates a repeatable technical workflow that can be tested and deployed.",
      aiSolution:
        "Build a frontend interface that sends the selected mode and prompt to a protected API route. The backend calls the AI model, requests structured JSON, validates the response, and returns safe fields for rendering.",
      technicalImplementation:
        "Frontend: collect prompt and selected mode. API route: validate input, load OPENAI_API_KEY from environment variables, send mode-specific system prompt to OpenAI, parse JSON, normalize missing fields, and return the deployment brief. UI: render result cards and safely handle errors.",
      pseudocode:
        "function generateBrief(prompt, mode):\n  if prompt is empty: show validation error\n  send POST /api/ask with { prompt, mode }\n  server loads OPENAI_API_KEY\n  server selects mode-specific instructions\n  server calls OpenAI with JSON response format\n  server normalizes missing fields\n  client renders result cards\n  catch errors and show safe fallback",
      stepByStepPlan: [
        "Create the frontend input and mode selector.",
        "Send the prompt and mode to /api/ask.",
        "Build the protected backend route with environment variables.",
        "Request structured JSON from the model.",
        "Normalize and render the response safely.",
        "Test success, empty prompt, API failure, and malformed response cases.",
      ],
      workflowArchitecture:
        "Frontend input → /api/ask POST request → mode-specific system prompt → OpenAI JSON response → normalization layer → result cards rendered in the browser",
      risksAndGuardrails: [
        "Never expose API keys in frontend code.",
        "Validate prompt input before calling the API.",
        "Normalize missing JSON fields before rendering.",
        "Handle OpenAI errors without crashing the UI.",
      ],
      nextSteps: [
        "Test the same prompt across all three modes.",
        "Add loading and error states.",
        "Deploy to Vercel with OPENAI_API_KEY stored in environment variables.",
      ],
    };
  }

  if (mode === "Strategy") {
    return {
      ...modeFallbackBrief(selectedMode),
      problemUnderstanding:
        "The request should be evaluated as an AI adoption opportunity that needs a clear rollout path, stakeholder alignment, governance, and measurable business outcomes.",
      businessImpact:
        "A strong AI strategy can improve adoption, reduce operational confusion, control risk, and create a phased path from pilot to production.",
      aiSolution:
        "Position the AI assistant as a controlled deployment initiative with a pilot group, success metrics, training plan, governance rules, and leadership review checkpoints.",
      technicalImplementation: "",
      pseudocode: "",
      stepByStepPlan: [
        "Define the business objective and executive sponsor.",
        "Select a small pilot workflow.",
        "Identify stakeholders, risks, and adoption barriers.",
        "Create governance and human review rules.",
        "Measure pilot success with clear KPIs.",
        "Scale only after the process proves value.",
      ],
      workflowArchitecture:
        "Leadership goal → pilot workflow → stakeholder alignment → governance controls → training → KPI review → phased scale-up",
      risksAndGuardrails: [
        "Avoid deploying AI without ownership.",
        "Train users before rollout.",
        "Protect sensitive data.",
        "Use KPIs to decide whether to scale.",
      ],
      nextSteps: [
        "Pick the first department or workflow.",
        "Define measurable success metrics.",
        "Create a 30/60/90-day rollout plan.",
      ],
    };
  }

  return fallbackBrief;
}

function asArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return Array.isArray(fallback) ? fallback : [];
}

function normalizeBrief(value) {
  const source = value?.brief || value?.analysis || value?.output || value?.result || value || {};

  const deploymentPlan = asArray(
    source.deploymentPlan || source.deployment_plan || source.steps,
    fallbackBrief.deploymentPlan
  );

  const stepByStepPlan = asArray(
    source.stepByStepPlan || source.step_by_step_plan || deploymentPlan,
    deploymentPlan
  );

  return {
    problemUnderstanding:
      source.problemUnderstanding ||
      source.problem ||
      source.problem_understanding ||
      fallbackBrief.problemUnderstanding,

    businessImpact:
      source.businessImpact ||
      source.business_impact ||
      source.impact ||
      fallbackBrief.businessImpact,

    aiSolution:
      source.aiSolution ||
      source.solution ||
      source.ai_solution ||
      fallbackBrief.aiSolution,

    technicalImplementation:
      source.technicalImplementation ||
      source.technical_implementation ||
      source.implementation ||
      source.codeImplementation ||
      fallbackBrief.technicalImplementation,

    pseudocode:
      source.pseudocode ||
      source.pseudoCode ||
      source.pseudo_code ||
      source.codePlan ||
      fallbackBrief.pseudocode,

    deploymentPlan,
    stepByStepPlan,

    workflowArchitecture:
      source.workflowArchitecture ||
      source.workflow ||
      source.architecture ||
      source.workflow_architecture ||
      fallbackBrief.workflowArchitecture,

    risksAndGuardrails: asArray(
      source.risksAndGuardrails || source.risks || source.guardrails,
      fallbackBrief.risksAndGuardrails
    ),

    nextSteps: asArray(
      source.nextSteps || source.next_steps || source.recommendedNextSteps,
      fallbackBrief.nextSteps
    ),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ...modeFallbackBrief(selectedMode),
      mode: "Business",
      analysis: modeFallbackBrief(selectedMode),
      brief: modeFallbackBrief(selectedMode),
      output: modeFallbackBrief(selectedMode),
      error: "Method not allowed. Use POST.",
    });
  }

  const selectedMode = req.body?.mode || "Business";
  const modeInstruction = modePrompts[selectedMode] || modePrompts.Business;

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ...modeFallbackBrief(selectedMode),
        mode: selectedMode,
        analysis: modeFallbackBrief(selectedMode),
        brief: modeFallbackBrief(selectedMode),
        output: modeFallbackBrief(selectedMode),
        error:
          "OPENAI_API_KEY is not configured. Add it to Vercel Environment Variables and redeploy.",
      });
    }

    const { request, prompt, message, history } = req.body || {};

    const userRequest =
      request ||
      prompt ||
      message ||
      "Create an AI deployment brief for a business that wants to use AI to improve operations.";

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `
You are the AI Deployment Console assistant for Anthony Spearman's professional portfolio.

The user may type anything: a business idea, coding request, strategy question, vague thought, job-related prompt, or incomplete sentence.

${modeInstruction}

Always return valid JSON only.

Return exactly this shape:
{
  "problemUnderstanding": "string",
  "businessImpact": "string",
  "aiSolution": "string",
  "technicalImplementation": "string",
  "pseudocode": "string",
  "deploymentPlan": ["string", "string", "string"],
  "stepByStepPlan": ["string", "string", "string"],
  "workflowArchitecture": "string",
  "risksAndGuardrails": ["string", "string", "string"],
  "nextSteps": ["string", "string", "string"]
}

Rules:
- No markdown.
- No code fences.
- No extra text outside JSON.
- If the prompt is vague, infer the most useful deployment use case.
- Each mode must answer differently even if the user enters the exact same prompt.
- Business mode must sound operational and business-focused.
- Coding mode must include code-oriented implementation thinking and pseudocode.
- Strategy mode must sound executive, phased, adoption-focused, and governance-aware.
- Keep it practical, recruiter-friendly, and focused on real AI deployment.
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
      temperature: 0.62,
      max_tokens: 950,
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
      ...brief,
      mode: selectedMode,
      analysis: brief,
      brief,
      output: brief,
      result: brief,
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
      ...modeFallbackBrief(selectedMode),
      mode: selectedMode,
      analysis: modeFallbackBrief(selectedMode),
      brief: modeFallbackBrief(selectedMode),
      output: modeFallbackBrief(selectedMode),
      result: modeFallbackBrief(selectedMode),
      error: message,
    });
  }
}
