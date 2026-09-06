/** @type {import('./ModelProvider.js').ModelProvider} */
export const anthropicProvider = {
  async send(messages, config) {
    const systemParts = [];
    if (config.systemPrompt) {
      systemParts.push(config.systemPrompt);
    }
    for (const message of messages) {
      if (message.role === 'system') {
        systemParts.push(message.content);
      }
    }

    const anthropicMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.modelName,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        system: systemParts.length ? systemParts.join('\n\n') : undefined,
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      throw new Error('Language model request failed.');
    }

    const payload = await response.json();
    const text = payload.content?.find((part) => part.type === 'text')?.text?.trim();
    if (!text) {
      throw new Error('Empty response from language model.');
    }
    return text;
  },
};
