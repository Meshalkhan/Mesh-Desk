import { BadRequestError } from '../utils/appError.js';
import { openaiProvider } from './openaiProvider.js';
import { anthropicProvider } from './anthropicProvider.js';
import { groqProvider } from './groqProvider.js';
import { geminiProvider } from './geminiProvider.js';

const providers = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  groq: groqProvider,
  gemini: geminiProvider,
};

export function resolveModelProvider(providerName) {
  const provider = providers[providerName];
  if (!provider) {
    throw new BadRequestError('Unsupported model provider.');
  }
  return provider;
}
