import * as adminUserService from '../services/adminUserService.js';

export async function listUsers(req, res) {
  const result = await adminUserService.listUsers(req.query);
  res.json(result);
}

export async function getUserStats(req, res) {
  const stats = await adminUserService.getUserStats(req.params.id);
  res.json(stats);
}

export async function updateRole(req, res) {
  const user = await adminUserService.updateUserRole(req.user._id, req.params.id, req.body.role);
  res.json(user);
}

export async function updateStatus(req, res) {
  const user = await adminUserService.updateUserStatus(req.user._id, req.params.id, req.body.isActive);
  res.json(user);
}

export async function bulkUpdateStatus(req, res) {
  const result = await adminUserService.bulkUpdateUserStatus(
    req.user._id,
    req.body.userIds,
    req.body.isActive,
  );
  res.json(result);
}

export async function forcePasswordReset(req, res) {
  const result = await adminUserService.forcePasswordReset(req.user._id, req.params.id);
  res.json(result);
}
