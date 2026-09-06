import { AuditLog } from '../models/AuditLog.js';

export async function logAdminAction({ actorId, targetUserId = null, action, metadata = null }) {
  await AuditLog.create({
    actorId,
    targetUserId,
    action,
    metadata,
  });
}
