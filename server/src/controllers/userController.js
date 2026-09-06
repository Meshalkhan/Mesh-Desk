import * as userService from '../services/userService.js';

export async function list(req, res) {
  const users = await userService.listOtherUsers(req.user._id);
  res.json(users);
}
