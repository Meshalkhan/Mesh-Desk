import { getSettingsService } from './settingsService.js';
import { getProviderApiKeySetting } from '../config/providerKeys.js';
import { DEFAULT_SYSTEM_PROMPT } from '../config/defaultSystemPrompt.js';
import { resolveModelProvider } from '../providers/modelProviderFactory.js';
import { getDefaultModel } from './aiModelService.js';
import { ExternalServiceError } from '../utils/appError.js';
import { wrapExternal } from '../utils/wrapExternal.js';

function buildSendConfig(aiModel) {
  const settings = getSettingsService();
  const settingKey = getProviderApiKeySetting(aiModel.provider);
  if (!settingKey) {
    throw new ExternalServiceError('Model provider is not supported.', {
      statusCode: 503,
      service: 'llm',
    });
  }

  const apiKey = settings.get(settingKey);
  if (!apiKey) {
    throw new ExternalServiceError('Model provider credentials are not configured.', {
      statusCode: 503,
      service: 'llm',
    });
  }

  return {
    modelName: aiModel.modelName,
    temperature: aiModel.config?.temperature ?? 0.6,
    maxTokens: aiModel.config?.maxTokens ?? 1024,
    systemPrompt: aiModel.config?.systemPromptOverride || DEFAULT_SYSTEM_PROMPT,
    apiKey,
  };
}

async function invokeModel(aiModel, priorMessages, userMessage) {
  const provider = resolveModelProvider(aiModel.provider);
  const config = buildSendConfig(aiModel);
  const messages = [
    ...priorMessages.filter((m) => m.role === 'user' || m.role === 'assistant'),
    { role: 'user', content: userMessage },
  ];

  return wrapExternal('llm', () => provider.send(messages, config));
}

function isSameModel(a, b) {
  if (!a || !b) return false;
  return String(a.id || a._id) === String(b.id || b._id);
}

export async function testModelConnection(aiModel) {
  const start = Date.now();
  const content = await invokeModel(aiModel, [], 'Reply with exactly: OK');
  return {
    success: true,
    latencyMs: Date.now() - start,
    preview: content.slice(0, 80),
  };
}

export async function generateAssistantReply({ aiModel, priorMessages, userMessage }) {
  try {
    const content = await invokeModel(aiModel, priorMessages, userMessage);
    return {
      content,
      usedModel: aiModel,
      fallback: null,
    };
  } catch (_primaryError) {
    const defaultModel = await getDefaultModel();
    if (!defaultModel || isSameModel(aiModel, defaultModel)) {
      throw ExternalServiceError.fromCause('llm', _primaryError);
    }

    try {
      const content = await invokeModel(defaultModel, priorMessages, userMessage);
      return {
        content,
        usedModel: defaultModel,
        fallback: {
          requestedModel: aiModel.displayName,
          usedModel: defaultModel.displayName,
          message: `Could not reach ${aiModel.displayName}. Responded with ${defaultModel.displayName} instead.`,
        },
      };
    } catch (_fallbackError) {
      throw ExternalServiceError.fromCause('llm', _fallbackError);
    }
  }
}
