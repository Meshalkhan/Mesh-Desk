/**
 * @typedef {Object} ModelMessage
 * @property {'system'|'user'|'assistant'} role
 * @property {string} content
 */

/**
 * @typedef {Object} ModelSendConfig
 * @property {string} modelName
 * @property {number} temperature
 * @property {number} maxTokens
 * @property {string|null} systemPrompt
 * @property {string} apiKey
 */

/**
 * @typedef {Object} ModelProvider
 * @property {(messages: ModelMessage[], config: ModelSendConfig) => Promise<string>} send
 */

export {};
