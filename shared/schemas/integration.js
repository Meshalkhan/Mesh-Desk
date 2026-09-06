import { z } from 'zod';

/** Official Pusher Channels cluster codes */
export const PUSHER_CLUSTERS = ['mt1', 'us2', 'us3', 'eu', 'ap1', 'ap2', 'ap3', 'ap4', 'sa1'];

export const pusherClusterSchema = z.enum(PUSHER_CLUSTERS, {
  errorMap: () => ({ message: `Cluster must be one of: ${PUSHER_CLUSTERS.join(', ')}` }),
});

export const integrationSettingKeySchema = z.enum([
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'JWT_SECRET',
  'PUSHER_APP_ID',
  'PUSHER_KEY',
  'PUSHER_SECRET',
  'PUSHER_CLUSTER',
  'CLIENT_URL',
]);

export const integrationSettingParamSchema = z.object({
  key: integrationSettingKeySchema,
});

export const integrationSettingBodySchema = z.object({
  value: z.string().trim().min(1, 'Setting value is required.'),
});

export const INTEGRATION_VALUE_SCHEMAS = {
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required.'),
  ANTHROPIC_API_KEY: z.string().min(1, 'Anthropic API key is required.'),
  GROQ_API_KEY: z.string().min(1, 'Groq API key is required.'),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required.'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters.'),
  PUSHER_APP_ID: z.string().min(1, 'Pusher app ID is required.'),
  PUSHER_KEY: z.string().min(1, 'Pusher key is required.'),
  PUSHER_SECRET: z.string().min(1, 'Pusher secret is required.'),
  PUSHER_CLUSTER: pusherClusterSchema,
  CLIENT_URL: z.string().url('Client URL must be a valid URL.'),
};

export function validateIntegrationValue(key, value) {
  const schema = INTEGRATION_VALUE_SCHEMAS[key];
  if (!schema) {
    throw new Error('Unknown integration setting key.');
  }
  return schema.parse(value);
}

export const pusherSettingsFormSchema = z
  .object({
    PUSHER_APP_ID: z.string().optional(),
    PUSHER_KEY: z.string().optional(),
    PUSHER_SECRET: z.string().optional(),
    PUSHER_CLUSTER: z
      .string()
      .optional()
      .refine(
        (value) => !value?.trim() || PUSHER_CLUSTERS.includes(value.trim()),
        { message: `Cluster must be one of: ${PUSHER_CLUSTERS.join(', ')}` },
      ),
  })
  .refine(
    (data) => Object.values(data).some((value) => value?.trim()),
    { message: 'Enter at least one Pusher field to update', path: ['PUSHER_APP_ID'] },
  );

export const providerKeyFormSchema = z.object({
  value: z.string().trim().min(1, 'API key is required.'),
});
