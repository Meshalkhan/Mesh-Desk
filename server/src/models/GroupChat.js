import mongoose from 'mongoose';

const groupChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

groupChatSchema.index({ participants: 1, updatedAt: -1 });

export const GroupChat = mongoose.model('GroupChat', groupChatSchema);
