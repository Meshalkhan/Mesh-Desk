import OpenAI from 'openai';

/** @type {import('./ModelProvider.js').ModelProvider} */
export const openaiProvider = {
  async send(messages, config) {
    const client = new OpenAI({ apiKey: config.apiKey });
    const system = config.systemPrompt;
    const chatMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.filter((m) => m.role !== 'system'),
    ];

    const completion = await client.chat.completions.create({
      model: config.modelName,
      messages: chatMessages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('Empty response from language model.');
    }
    return text;
  },
};
