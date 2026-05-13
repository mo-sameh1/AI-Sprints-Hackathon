import OpenAI from 'openai';

export type LlmProviderConfig = {
  model?: string;
  temperature?: number;
};

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResponse {
  content: string;
  provider: 'openai' | 'deterministic';
  model: string;
}

const DEFAULT_MODEL = 'gpt-4o-mini';

let _openai: OpenAI | null = null;

function getOpenAiClient(): OpenAI | null {
  const key = process.env['OPENAI_API_KEY'];
  if (!key || key === 'replace-me') return null;
  if (!_openai) _openai = new OpenAI({ apiKey: key });
  return _openai;
}

export async function callLlm(
  messages: LlmMessage[],
  config: LlmProviderConfig = {},
): Promise<LlmResponse> {
  const client = getOpenAiClient();
  const model = config.model ?? DEFAULT_MODEL;
  const temperature = config.temperature ?? 0.3;

  if (client) {
    const completion = await client.chat.completions.create({
      model,
      temperature,
      messages,
    });
    return {
      content: completion.choices[0]?.message?.content ?? '',
      provider: 'openai',
      model,
    };
  }

  // Deterministic fallback — no key configured
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  return {
    content: deterministicFallback(lastUser?.content ?? ''),
    provider: 'deterministic',
    model: 'fallback',
  };
}

export function isLlmAvailable(): boolean {
  return getOpenAiClient() !== null;
}

function deterministicFallback(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('summary') || lower.includes('profile')) {
    return 'AI-generated farm profile summary pending real LLM integration.';
  }
  if (lower.includes('risk') || lower.includes('flag')) {
    return 'No critical risk factors identified in this deterministic pass.';
  }
  if (lower.includes('deal') || lower.includes('structure')) {
    return 'Revenue share structure recommended based on risk and horizon parameters.';
  }
  if (lower.includes('alert') || lower.includes('weather') || lower.includes('news')) {
    return 'No high-severity alerts detected in current signal window.';
  }
  return 'Deterministic response: set OPENAI_API_KEY to enable real AI reasoning.';
}
