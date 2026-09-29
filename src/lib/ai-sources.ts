// Assistants IA qui envoient des lecteurs vers le site (lien cité dans une réponse puis cliqué)

export const AI_SOURCES = {
  chatgpt: { label: "ChatGPT", hosts: ["chatgpt.com", "chat.openai.com"], utm: ["chatgpt.com", "chatgpt", "openai"] },
  gemini: { label: "Gemini", hosts: ["gemini.google.com", "bard.google.com"], utm: ["gemini"] },
  perplexity: { label: "Perplexity", hosts: ["perplexity.ai", "www.perplexity.ai"], utm: ["perplexity", "perplexity.ai"] },
  claude: { label: "Claude", hosts: ["claude.ai"], utm: ["claude.ai", "claude"] },
  copilot: { label: "Copilot", hosts: ["copilot.microsoft.com"], utm: ["copilot"] },
  deepseek: { label: "DeepSeek", hosts: ["chat.deepseek.com"], utm: ["deepseek"] },
  mistral: { label: "Le Chat (Mistral)", hosts: ["chat.mistral.ai"], utm: ["mistral"] },
  meta: { label: "Meta AI", hosts: ["www.meta.ai", "meta.ai"], utm: ["meta.ai"] },
  grok: { label: "Grok", hosts: ["grok.com", "x.ai"], utm: ["grok"] },
} as const;

export type AiSource = keyof typeof AI_SOURCES;

export function isAiSource(s: unknown): s is AiSource {
  return typeof s === "string" && s in AI_SOURCES;
}

/** Détermine l'assistant IA d'origine à partir du référent et du paramètre utm_source */
export function classifyAiSource(referrer: string, utmSource: string | null): AiSource | null {
  const utm = utmSource?.toLowerCase().trim();
  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase() : "";
  } catch { /* référent illisible */ }

  for (const [key, def] of Object.entries(AI_SOURCES) as [AiSource, (typeof AI_SOURCES)[AiSource]][]) {
    if (host && def.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return key;
    if (utm && (def.utm as readonly string[]).includes(utm)) return key;
  }
  return null;
}

// Robots comptés par scripts/ai-bots-stats.mjs (mêmes clés), pour l'affichage du dashboard
export const AI_BOTS: Record<string, { label: string; group: string; kind: "live" | "index" | "training" }> = {
  "chatgpt-user": { label: "ChatGPT-User", group: "OpenAI", kind: "live" },
  "oai-searchbot": { label: "OAI-SearchBot", group: "OpenAI", kind: "index" },
  gptbot: { label: "GPTBot", group: "OpenAI", kind: "training" },
  "claude-user": { label: "Claude-User", group: "Anthropic", kind: "live" },
  "claude-searchbot": { label: "Claude-SearchBot", group: "Anthropic", kind: "index" },
  claudebot: { label: "ClaudeBot", group: "Anthropic", kind: "training" },
  "perplexity-user": { label: "Perplexity-User", group: "Perplexity", kind: "live" },
  perplexitybot: { label: "PerplexityBot", group: "Perplexity", kind: "index" },
  "mistralai-user": { label: "MistralAI-User", group: "Mistral", kind: "live" },
  duckassistbot: { label: "DuckAssistBot", group: "DuckDuckGo", kind: "live" },
  "meta-externalagent": { label: "Meta-ExternalAgent", group: "Meta", kind: "training" },
  applebot: { label: "Applebot", group: "Apple", kind: "index" },
  amazonbot: { label: "Amazonbot", group: "Amazon", kind: "index" },
  bytespider: { label: "Bytespider", group: "ByteDance", kind: "training" },
  ccbot: { label: "CCBot", group: "Common Crawl", kind: "training" },
  googlebot: { label: "Googlebot", group: "Google", kind: "index" },
  bingbot: { label: "Bingbot", group: "Bing", kind: "index" },
};
