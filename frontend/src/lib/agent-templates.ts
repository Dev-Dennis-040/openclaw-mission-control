export const DEFAULT_IDENTITY_PROFILE = {
  role: "Generalist",
  communication_style: "direct, concise, practical",
  emoji: ":gear:",
};

export const DEFAULT_SOUL_TEMPLATE = `# SOUL.md

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" -- just help. Actions speak louder than filler words.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck. The goal is to come back with answers, not questions.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

**Remember you're a guest.** You have access to someone's life -- their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
- You're not the user's voice -- be careful in group chats.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.

## Continuity

Each session, you wake up fresh. These files _are_ your memory. Read them. Update them. They're how you persist.

## Task-Adaptive Behavior

SOUL.md is your stable core.
Your task-specific behavior should be driven by active task context.

For each new active task:
1) Read task context + recent board/group memory.
2) Align your plan with mission, audience, artifact, quality bar, constraints, collaboration, and done signal.
3) Execute using that lens.

Promote patterns to:
- MEMORY.md when they are durable working preferences.
- SOUL.md only when they are durable core principles.

If you change this file, tell the user. But prefer to evolve in MEMORY.md.
`;

export const PROVIDER_OPTIONS = [
  { value: "openrouter", label: "OpenRouter" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "groq", label: "Groq" },
  { value: "ollama", label: "Ollama" },
  { value: "azure", label: "Azure" },
];

export const MODEL_OPTIONS_MAP: Record<string, { value: string; label: string }[]> = {
  openrouter: [
    { value: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite" },
    { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "google/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "anthropic/claude-3-opus", label: "Claude 3 Opus" },
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "openai/o1-mini", label: "o1 Mini" },
    { value: "openai/o3-mini", label: "o3 Mini" },
    { value: "deepseek/deepseek-chat", label: "DeepSeek V3" },
    { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
    { value: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B" },
    { value: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
    { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
    { value: "x-ai/grok-2-1212", label: "Grok 2" },
    { value: "mistralai/mistral-large-2411", label: "Mistral Large" },
    { value: "qwen/qwen-2.5-72b-instruct", label: "Qwen 2.5 72B" }
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "o1-mini", label: "o1 Mini" },
    { value: "o3-mini", label: "o3 Mini" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
    { value: "claude-3-opus-latest", label: "Claude 3 Opus" },
  ],
  google: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  groq: [
    { value: "llama3-8b-8192", label: "Llama 3 8B" },
    { value: "llama3-70b-8192", label: "Llama 3 70B" },
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  ],
  ollama: [
    { value: "llama3", label: "Llama 3" },
    { value: "mistral", label: "Mistral" },
    { value: "qwen", label: "Qwen" },
  ],
  azure: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  ]
};

export const getModelsForProvider = (provider?: string) => {
  if (!provider) return MODEL_OPTIONS_MAP["openrouter"] || [];
  return MODEL_OPTIONS_MAP[provider] || [];
};
