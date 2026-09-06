import mongoose from 'mongoose';
import { AI_PROVIDERS } from '../config/defaultSystemPrompt.js';

const aiModelConfigSchema = new mongoose.Schema(
  {
    temperature: { type: Number, default: 0.6, min: 0, max: 2 },
    maxTokens: { type: Number, default: 1024, min: 1, max: 128000 },
    systemPromptOverride: { type: String, default: null },
  },
  { _id: false }
);

const aiModelSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: AI_PROVIDERS,
      required: true,
    },
    modelName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    config: { type: aiModelConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

aiModelSchema.index({ isActive: 1, displayName: 1 });
aiModelSchema.index({ isDefault: 1 });

export const AIModel = mongoose.model('AIModel', aiModelSchema);
