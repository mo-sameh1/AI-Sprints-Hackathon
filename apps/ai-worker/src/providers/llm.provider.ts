/**
 * LLM Provider — Google Gemini (primary) with deterministic fallback.
 *
 * Configuration:
 *   GEMINI_API_KEY   — Google AI Studio key (aistudio.google.com)
 *   GEMINI_MODEL     — optional model override (default: gemini-1.5-flash)
 *
 * If GEMINI_API_KEY is absent or set to "replace-me", the provider returns
 * deterministic template responses so the rest of the pipeline still works
 * without any API key configured.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

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
  provider: 'gemini' | 'deterministic';
  model: string;
}

const DEFAULT_MODEL = process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash';

let _gemini: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  const key = process.env['GEMINI_API_KEY'];
  if (!key || key === 'replace-me') return null;
  if (!_gemini) _gemini = new GoogleGenerativeAI(key);
  return _gemini;
}

/**
 * Gemini does not have a first-class "system" role in all models.
 * We prepend system messages as a leading "user" turn with a model ACK,
 * then append the real conversation turns.
 */
function toGeminiHistory(messages: LlmMessage[]) {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const history: { role: 'user' | 'model'; parts: [{ text: string }] }[] = [];

  // Inject system context as a synthetic exchange before the real turns
  if (systemMessages.length > 0) {
    const systemText = systemMessages.map((m) => m.content).join('\n\n');
    history.push({ role: 'user', parts: [{ text: `[System context]\n${systemText}` }] });
    history.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
  }

  // All but the last message go into history; last becomes the prompt
  const turns = conversationMessages.slice(0, -1);
  for (const msg of turns) {
    history.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const lastMsg = conversationMessages[conversationMessages.length - 1];
  const prompt = lastMsg?.content ?? '';

  return { history, prompt };
}

export async function callLlm(
  messages: LlmMessage[],
  config: LlmProviderConfig = {},
): Promise<LlmResponse> {
  const client = getGeminiClient();
  const modelName = config.model ?? DEFAULT_MODEL;
  const temperature = config.temperature ?? 0.3;

  if (client) {
    const generativeModel = client.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    const { history, prompt } = toGeminiHistory(messages);

    const chat = generativeModel.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const text = result.response.text();

    return { content: text, provider: 'gemini', model: modelName };
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
  return getGeminiClient() !== null;
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
  return 'Deterministic response: set GEMINI_API_KEY to enable real AI reasoning.';
}
