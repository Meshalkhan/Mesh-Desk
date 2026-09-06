import * as authService from '../services/authService.js';

export async function signup(req, res) {
  const result = await authService.signupUser(req.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await authService.loginUser(req.body);
  res.json(result);
}
