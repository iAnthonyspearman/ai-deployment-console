const requestInput = document.getElementById("requestInput");
const generateBtn = document.getElementById("generateBtn");
const charCount = document.getElementById("charCount");
const errorBox = document.getElementById("errorBox");
const loadingPanel = document.getElementById("loadingPanel");
const loadingText = document.getElementById("loadingText");
const results = document.getElementById("results");
const modeBadge = document.getElementById("modeBadge");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyList = document.getElementById("historyList");
const modeExplainer = document.getElementById("modeExplainer");
const tabs = Array.from(document.querySelectorAll(".tab"));
const promptChips = Array.from(document.querySelectorAll(".prompt-chip"));

const resultEls = {
  problemUnderstanding: document.getElementById("problemUnderstanding"),
  businessImpact: document.getElementById("businessImpact"),
  aiSolution: document.getElementById("aiSolution"),
  technicalImplementation: document.getElementById("technicalImplementation"),
  pseudocode: document.getElementById("pseudocode"),
  stepByStepPlan: document.getElementById("stepByStepPlan"),
  workflowArchitecture: document.getElementById("workflowArchitecture"),
  risksAndGuardrails: document.getElementById("risksAndGuardrails"),
  nextSteps: document.getElementById("nextSteps"),
};


const resultTitles = {
  Business: {
    problem: "Business Problem",
    impact: "Operational / Revenue Impact",
    solution: "Business AI Workflow",
    plan: "Business Deployment Plan",
    architecture: "Business Process Flow",
    risk: "Business Risks and Guardrails",
    next: "Business Next Steps",
  },
  Coding: {
    problem: "Technical Problem",
    impact: "Technical Impact",
    solution: "Build Approach",
    plan: "Implementation Plan",
    architecture: "Technical Architecture",
    risk: "Engineering Risks and Guardrails",
    next: "Developer Next Steps",
  },
  Strategy: {
    problem: "Strategic Opportunity",
    impact: "Executive Business Impact",
    solution: "Strategic AI Direction",
    plan: "Rollout Strategy",
    architecture: "Operating Model",
    risk: "Governance and Risk Controls",
    next: "Leadership Next Steps",
  },
};

function updateResultTitles(mode) {
  const titles = resultTitles[mode] || resultTitles.Business;

  const titleMap = {
    problemTitle: titles.problem,
    impactTitle: titles.impact,
    solutionTitle: titles.solution,
    planTitle: titles.plan,
    architectureTitle: titles.architecture,
    riskTitle: titles.risk,
    nextTitle: titles.next,
  };

  Object.entries(titleMap).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  document.querySelectorAll(".coding-card").forEach((card) => {
    card.style.display = mode === "Coding" ? "" : "none";
  });
}

const modeCopy = {
  Business:
    "Business mode turns an operational problem into a practical AI workflow with impact, automation, and implementation steps.",
  Coding:
    "Coding mode turns a technical request into an implementation plan with API behavior, data flow, build steps, and guardrails.",
  Strategy:
    "Strategy mode turns an idea into an executive rollout brief with adoption, governance, stakeholders, risk, and measurable value.",
};

let currentMode = "Business";
let history = [];

const fallbackBrief = {
  problemUnderstanding:
    "The request was received. The AI Deployment Console will translate it into a clear business or technical problem before recommending a solution.",
  businessImpact:
    "A structured AI workflow can improve speed, clarity, automation, customer experience, and decision-making.",
  aiSolution:
    "Use AI to analyze the request, identify the workflow, recommend a deployment approach, and produce practical next steps.",
  technicalImplementation:
    "Create a frontend request form, send the prompt and selected mode to a protected API route, call the AI model server-side, return a structured JSON response, and render the deployment brief safely in the dashboard.",
  pseudocode:
    "function handleSubmit(prompt, mode):\n  validate prompt\n  send POST request to /api/ask with prompt and mode\n  API calls OpenAI with mode-specific instructions\n  receive structured JSON brief\n  normalize missing fields\n  render result cards\n  handle errors safely",
  deploymentPlan: [
    "Capture the user request.",
    "Identify the business or technical goal.",
    "Generate a structured deployment brief.",
    "Review the AI recommendation.",
    "Turn the best next step into action.",
  ],
  stepByStepPlan: [
    "Capture the user request.",
    "Identify the business or technical goal.",
    "Generate a structured deployment brief.",
    "Review the AI recommendation.",
    "Turn the best next step into action.",
  ],
  workflowArchitecture:
    "Prompt → API Route → OpenAI Model → Structured Brief → Dashboard Output → Human Review",
  risksAndGuardrails: [
    "Protect private API keys and sensitive data.",
    "Review AI output before production use.",
    "Validate technical steps before deploying.",
  ],
  nextSteps: [
    "Clarify the desired outcome.",
    "Choose the first workflow to improve.",
    "Test the recommendation with a real example.",
  ],
  mode: "Business",
};

function asArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return Array.isArray(fallback) ? fallback : [];
}

function asText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeBrief(data) {
  const source =
    data?.analysis ||
    data?.brief ||
    data?.output ||
    data?.result ||
    data ||
    {};

  const deploymentPlan = asArray(
    source.deploymentPlan || source.deployment_plan || source.steps,
    fallbackBrief.deploymentPlan
  );

  const stepByStepPlan = asArray(
    source.stepByStepPlan || source.step_by_step_plan || deploymentPlan,
    deploymentPlan
  );

  return {
    problemUnderstanding: asText(
      source.problemUnderstanding || source.problem || source.problem_understanding,
      fallbackBrief.problemUnderstanding
    ),
    businessImpact: asText(
      source.businessImpact || source.business_impact || source.impact,
      fallbackBrief.businessImpact
    ),
    aiSolution: asText(
      source.aiSolution || source.ai_solution || source.solution,
      fallbackBrief.aiSolution
    ),
    technicalImplementation: asText(
      source.technicalImplementation || source.technical_implementation || source.implementation || source.codeImplementation,
      fallbackBrief.technicalImplementation
    ),
    pseudocode: asText(
      source.pseudocode || source.pseudoCode || source.pseudo_code || source.codePlan,
      fallbackBrief.pseudocode
    ),
    deploymentPlan,
    stepByStepPlan,
    workflowArchitecture: asText(
      source.workflowArchitecture || source.workflow_architecture || source.workflow || source.architecture,
      fallbackBrief.workflowArchitecture
    ),
    risksAndGuardrails: asArray(
      source.risksAndGuardrails || source.risks_and_guardrails || source.risks || source.guardrails,
      fallbackBrief.risksAndGuardrails
    ),
    nextSteps: asArray(
      source.nextSteps || source.next_steps || source.recommendedNextSteps,
      fallbackBrief.nextSteps
    ),
    mode: asText(source.mode || data?.mode, currentMode || fallbackBrief.mode),
  };
}


const loadingMessages = {
  Business: [
    "Reading the request through a business workflow lens...",
    "Mapping operational impact, customer flow, and automation value...",
    "Building the deployment plan with business guardrails...",
    "Preparing the executive-ready business brief..."
  ],
  Coding: [
    "Reading the request through an engineering lens...",
    "Mapping frontend, API route, data shape, and response handling...",
    "Creating pseudocode, validation steps, and implementation flow...",
    "Preparing the technical deployment brief..."
  ],
  Strategy: [
    "Reading the request through a strategic rollout lens...",
    "Mapping stakeholders, adoption risks, governance, and KPIs...",
    "Building a phased strategy with leadership checkpoints...",
    "Preparing the executive strategy brief..."
  ],
};

let loadingInterval = null;

function setLoadingState(isLoading) {
  if (!loadingPanel) return;

  const steps = Array.from(document.querySelectorAll(".loading-step"));
  const messages = loadingMessages[currentMode] || loadingMessages.Business;
  let index = 0;

  if (!isLoading) {
    loadingPanel.classList.remove("show");
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex === 0);
    });
    return;
  }

  loadingPanel.classList.add("show");
  if (loadingText) loadingText.textContent = messages[0];

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === 0);
  });

  if (loadingInterval) clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    index = (index + 1) % messages.length;

    if (loadingText) loadingText.textContent = messages[index];

    steps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex <= index);
    });
  }, 1050);
}

function setError(message = "") {
  if (!message) {
    errorBox.textContent = "";
    errorBox.classList.remove("show");
    return;
  }

  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function renderList(element, items) {
  element.innerHTML = "";
  asArray(items).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

function renderBrief(brief) {
  const safe = normalizeBrief(brief);

  resultEls.problemUnderstanding.textContent = safe.problemUnderstanding;
  resultEls.businessImpact.textContent = safe.businessImpact;
  resultEls.aiSolution.textContent = safe.aiSolution;
  if (resultEls.technicalImplementation) {
    resultEls.technicalImplementation.textContent = safe.technicalImplementation;
  }
  if (resultEls.pseudocode) {
    resultEls.pseudocode.textContent = safe.pseudocode;
  }
  resultEls.workflowArchitecture.textContent = safe.workflowArchitecture;

  renderList(resultEls.stepByStepPlan, safe.stepByStepPlan);
  renderList(resultEls.risksAndGuardrails, safe.risksAndGuardrails);
  renderList(resultEls.nextSteps, safe.nextSteps);

  modeBadge.textContent = safe.mode;
  updateResultTitles(safe.mode);
  results.classList.add("show");
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "history-item";
    empty.textContent = "Recent prompts appear here.";
    historyList.appendChild(empty);
    return;
  }

  history.slice(0, 5).forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.textContent = `${item.mode}: ${item.prompt}`;
    historyList.appendChild(div);
  });
}

function setMode(mode) {
  currentMode = mode || "Business";
  tabs.forEach((item) => item.classList.toggle("active", item.dataset.mode === currentMode));
  modeBadge.textContent = currentMode;
  modeExplainer.textContent = modeCopy[currentMode] || modeCopy.Business;
  updateResultTitles(currentMode);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setMode(tab.dataset.mode || "Business");
  });
});

promptChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    requestInput.value = chip.dataset.prompt || "";
    charCount.textContent = String(requestInput.value.length);
    requestInput.focus();
  });
});

requestInput.addEventListener("input", () => {
  charCount.textContent = String(requestInput.value.length);
});

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

generateBtn.addEventListener("click", async () => {
  const prompt = requestInput.value.trim();

  if (!prompt) {
    setError("Enter a business, coding, or strategy request first.");
    return;
  }

  setError("");
  setLoadingState(true);
  generateBtn.disabled = true;
  generateBtn.textContent = `Generating ${currentMode} brief...`;

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: prompt,
        prompt,
        message: prompt,
        mode: currentMode,
        history: history.slice(0, 5).map((item) => ({
          role: "user",
          content: `${item.mode}: ${item.prompt}`,
        })),
      }),
    });

    const data = await response.json();
    const brief = normalizeBrief(data);

    if (!response.ok && data?.error) {
      setError(data.error);
    }

    renderBrief(brief);

    history.unshift({
      mode: currentMode,
      prompt,
    });

    renderHistory();
  } catch (error) {
    setError(error?.message || "The AI Deployment Console could not complete the request.");
    renderBrief({ ...fallbackBrief, mode: currentMode });
  } finally {
    setLoadingState(false);
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate AI Deployment Brief";
  }
});


const demoPrompt =
  "Build an AI assistant for a help desk team that summarizes tickets, detects urgent issues, drafts customer replies, routes tickets to the right department, and reports weekly support quality metrics.";

function populateDemoPrompt() {
  requestInput.value = demoPrompt;
  charCount.textContent = String(requestInput.value.length);
  setMode("Business");
  requestInput.focus();
  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });

  requestInput.classList.remove("demo-flash");
  void requestInput.offsetWidth;
  requestInput.classList.add("demo-flash");
}

document.getElementById("heroDemoBtn")?.addEventListener("click", (event) => {
  event.preventDefault();
  populateDemoPrompt();
});

document.getElementById("navDemoBtn")?.addEventListener("click", (event) => {
  event.preventDefault();
  populateDemoPrompt();
});

setMode("Business");
renderHistory();
