export const PROVIDER_API_KEY_MAP = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  groq: 'GROQ_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

export function getProviderApiKeySetting(provider) {
  return PROVIDER_API_KEY_MAP[provider] || null;
}
