import { z } from 'zod';

export const AI_PROVIDERS = ['openai', 'anthropic', 'groq', 'gemini'];

export const PROVIDER_MAX_TOKENS = {
  openai: 128000,
  anthropic: 200000,
  groq: 32768,
  gemini: 1048576,
};

export const aiModelIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid model id.'),
});

export const aiModelConfigSchema = z.object({
  temperature: z.number().min(0, 'Temperature must be at least 0.').max(2, 'Temperature must be at most 2.').optional(),
  maxTokens: z.number().int().min(1, 'Max tokens must be at least 1.').optional(),
  systemPromptOverride: z.string().nullable().optional(),
});

const aiModelBaseSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  modelName: z.string().trim().min(1, 'Model name is required.'),
  displayName: z.string().trim().min(1, 'Display name is required.'),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  config: aiModelConfigSchema.optional(),
});

function refineProviderMaxTokens(data, ctx) {
  const maxTokens = data.config?.maxTokens;
  if (maxTokens != null && data.provider) {
    const limit = PROVIDER_MAX_TOKENS[data.provider];
    if (maxTokens > limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['config', 'maxTokens'],
        message: `Max tokens cannot exceed ${limit.toLocaleString()} for ${data.provider}.`,
      });
    }
  }
}

export const aiModelCreateBodySchema = aiModelBaseSchema.superRefine(refineProviderMaxTokens);

export const aiModelUpdateBodySchema = aiModelBaseSchema.partial().superRefine(refineProviderMaxTokens);

/** Flat form shape used by admin UI — maps to create/update body on submit */
export const aiModelFormSchema = z
  .object({
    provider: z.enum(AI_PROVIDERS),
    modelName: z.string().trim().min(1, 'Model name is required.'),
    displayName: z.string().trim().min(1, 'Display name is required.'),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    temperature: z.coerce.number().min(0, 'Temperature must be at least 0.').max(2, 'Temperature must be at most 2.').default(0.6),
    maxTokens: z.coerce.number().int().min(1, 'Max tokens must be at least 1.').default(1024),
    systemPromptOverride: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const limit = PROVIDER_MAX_TOKENS[data.provider];
    if (data.maxTokens > limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxTokens'],
        message: `Max tokens cannot exceed ${limit.toLocaleString()} for ${data.provider}.`,
      });
    }
  });

export function aiModelFormToBody(values) {
  return {
    provider: values.provider,
    modelName: values.modelName,
    displayName: values.displayName,
    isActive: values.isActive,
    isDefault: values.isDefault,
    config: {
      temperature: values.temperature,
      maxTokens: values.maxTokens,
      systemPromptOverride: values.systemPromptOverride?.trim() || null,
    },
  };
}

export function aiModelToFormValues(model) {
  return {
    provider: model.provider,
    modelName: model.modelName,
    displayName: model.displayName,
    isActive: model.isActive ?? true,
    isDefault: model.isDefault ?? false,
    temperature: model.config?.temperature ?? 0.6,
    maxTokens: model.config?.maxTokens ?? 1024,
    systemPromptOverride: model.config?.systemPromptOverride || '',
  };
}
