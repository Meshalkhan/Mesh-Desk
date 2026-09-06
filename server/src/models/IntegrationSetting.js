import mongoose from 'mongoose';

const integrationSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    encryptedValue: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const IntegrationSetting = mongoose.model(
  'IntegrationSetting',
  integrationSettingSchema
);
