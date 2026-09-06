import {
  aiModelCreateBodySchema,
  aiModelUpdateBodySchema,
} from 'meshdesk-shared';
import mongoose from 'mongoose';
import { AIModel } from '../models/AIModel.js';
import { BadRequestError, ExternalServiceError, NotFoundError } from '../utils/appError.js';

function toPublicModel(doc) {
  return {
    id: doc._id,
    provider: doc.provider,
    modelName: doc.modelName,
    displayName: doc.displayName,
    isActive: doc.isActive,
    isDefault: doc.isDefault,
    config: doc.config,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function clearOtherDefaults(exceptId = null) {
  const filter = exceptId ? { _id: { $ne: exceptId } } : {};
  await AIModel.updateMany(filter, { $set: { isDefault: false } });
}

export async function listActiveModels() {
  const models = await AIModel.find({ isActive: true }).sort({ isDefault: -1, displayName: 1 }).lean();
  return models.map(toPublicModel);
}

export async function listAllModels() {
  const models = await AIModel.find().sort({ isDefault: -1, displayName: 1 }).lean();
  return models.map(toPublicModel);
}

export async function getDefaultModel() {
  let model = await AIModel.findOne({ isDefault: true, isActive: true }).lean();
  if (!model) {
    model = await AIModel.findOne({ isActive: true }).sort({ createdAt: 1 }).lean();
  }
  return model ? toPublicModel(model) : null;
}

export async function getModelById(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError('Invalid model id.');
  }
  const model = await AIModel.findById(id).lean();
  if (!model) {
    throw new NotFoundError('Model not found.');
  }
  return toPublicModel(model);
}

export async function getActiveModelById(id) {
  const model = await getModelById(id);
  if (!model.isActive) {
    throw new BadRequestError('Selected model is not active.');
  }
  return model;
}

export async function createModel(payload) {
  const parsed = aiModelCreateBodySchema.parse(payload);

  if (parsed.isDefault) {
    await clearOtherDefaults();
  }

  const created = await AIModel.create({
    provider: parsed.provider,
    modelName: parsed.modelName,
    displayName: parsed.displayName,
    isActive: parsed.isActive ?? true,
    isDefault: parsed.isDefault ?? false,
    config: {
      temperature: parsed.config?.temperature ?? 0.6,
      maxTokens: parsed.config?.maxTokens ?? 1024,
      systemPromptOverride: parsed.config?.systemPromptOverride ?? null,
    },
  });

  return toPublicModel(created.toObject());
}

export async function updateModel(id, payload) {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError('Invalid model id.');
  }

  const parsed = aiModelUpdateBodySchema.parse(payload);
  const existing = await AIModel.findById(id);
  if (!existing) {
    throw new NotFoundError('Model not found.');
  }

  if (parsed.isDefault) {
    await clearOtherDefaults(id);
  }

  if (parsed.provider !== undefined) existing.provider = parsed.provider;
  if (parsed.modelName !== undefined) existing.modelName = parsed.modelName;
  if (parsed.displayName !== undefined) existing.displayName = parsed.displayName;
  if (parsed.isActive !== undefined) existing.isActive = parsed.isActive;
  if (parsed.isDefault !== undefined) existing.isDefault = parsed.isDefault;
  if (parsed.config) {
    existing.config = {
      temperature: parsed.config.temperature ?? existing.config.temperature,
      maxTokens: parsed.config.maxTokens ?? existing.config.maxTokens,
      systemPromptOverride:
        parsed.config.systemPromptOverride !== undefined
          ? parsed.config.systemPromptOverride
          : existing.config.systemPromptOverride,
    };
  }

  await existing.save();
  return toPublicModel(existing.toObject());
}

export async function deactivateModel(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError('Invalid model id.');
  }

  const model = await AIModel.findById(id);
  if (!model) {
    throw new NotFoundError('Model not found.');
  }

  model.isActive = false;
  if (model.isDefault) {
    model.isDefault = false;
  }
  await model.save();

  const replacement = await AIModel.findOne({ isActive: true }).sort({ createdAt: 1 });
  if (replacement && !(await AIModel.exists({ isDefault: true, isActive: true }))) {
    replacement.isDefault = true;
    await replacement.save();
  }

  return toPublicModel(model.toObject());
}

export async function resolveModelForChat({ modelId, chatModelId }) {
  if (modelId) {
    return getActiveModelById(modelId);
  }
  if (chatModelId) {
    return getActiveModelById(chatModelId);
  }
  const fallback = await getDefaultModel();
  if (!fallback) {
    throw new ExternalServiceError('No active AI models are configured.', {
      statusCode: 503,
      service: 'llm',
    });
  }
  return fallback;
}
