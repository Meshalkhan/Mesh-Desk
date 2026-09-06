/** @type {import('./ModelProvider.js').ModelProvider} */
export const geminiProvider = {
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

    const contents = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.modelName)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: systemParts.length
          ? { parts: [{ text: systemParts.join('\n\n') }] }
          : undefined,
        contents,
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Language model request failed.');
    }

    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Empty response from language model.');
    }
    return text;
  },
};
