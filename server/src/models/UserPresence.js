import mongoose from 'mongoose';

const userPresenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    username: { type: String, required: true, trim: true },
    isOnline: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserPresence = mongoose.model('UserPresence', userPresenceSchema);
