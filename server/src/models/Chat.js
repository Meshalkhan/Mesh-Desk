import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIModel', default: null },
    modelDisplayName: { type: String, default: null },
    modelProvider: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled thread' },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    aiModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIModel',
      default: null,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatSchema.index({ owner: 1, updatedAt: -1 });

export const Chat = mongoose.model('Chat', chatSchema);
