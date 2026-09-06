import { User } from '../models/User.js';

export async function listOtherUsers(userId) {
  return User.find({ _id: { $ne: userId } })
    .select('_id username email')
    .sort({ username: 1 })
    .lean();
}
