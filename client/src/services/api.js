import { notifyToast } from '../lib/toastBridge.js';

export class ApiError extends Error {
  constructor(message, { code = null, fields = null, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.fields = fields;
    this.isNetworkError = isNetworkError;
  }
}

const base = import.meta.env.VITE_API_URL || '';

let authToken = null;
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function setAuthToken(token) {
  authToken = token;
}

export function getApiBaseUrl() {
  return base;
}

function parseErrorPayload(data) {
  if (data?.error?.code) {
    return new ApiError(data.error.message || 'Request failed.', {
      code: data.error.code,
      fields: data.error.fields || null,
    });
  }

  if (Array.isArray(data?.errors) && data.errors.length) {
    return new ApiError(data.errors[0]?.message || 'Validation failed.', {
      code: 'VALIDATION_FAILED',
      fields: data.errors,
    });
  }

  const message =
    (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
    data?.message ||
    'Request failed';
  return new ApiError(message);
}

function shouldAutoToast(apiError, options) {
  if (options.silent || options.skipToast) return false;
  if (apiError.isNetworkError) return false;
  if (apiError.fields?.length) return false;
  return true;
}

function autoNotify(apiError, options) {
  if (!shouldAutoToast(apiError, options)) return;
  const variant =
    apiError.code === 'AUTH_REQUIRED' ||
    apiError.code === 'AUTH_INVALID' ||
    apiError.code === 'AUTH_FORBIDDEN'
      ? 'warning'
      : 'error';
  notifyToast(variant, apiError.message);
}

async function request(path, options = {}) {
  const { silent = false, skipToast = false, ...fetchOptions } = options;
  const url = `${base}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let res;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new ApiError("You're offline or the server is unreachable.", {
      code: 'NETWORK_ERROR',
      isNetworkError: true,
    });
  }

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const apiError = parseErrorPayload(data);
    if (
      res.status === 401 &&
      (apiError.code === 'AUTH_REQUIRED' ||
        apiError.code === 'AUTH_INVALID' ||
        apiError.code === 'AUTH_FORBIDDEN') &&
      onUnauthorized
    ) {
      onUnauthorized(apiError);
    }
    autoNotify(apiError, { silent, skipToast });
    throw apiError;
  }
  return data;
}

export const api = {
  signup: (payload, opts) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipToast: true,
      ...opts,
    }),
  login: (payload, opts) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipToast: true,
      ...opts,
    }),
  listUsers: () => request('/api/users'),
  listChats: () => request('/api/chats'),
  createChat: (payload) =>
    request('/api/chats', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  getChat: (id) => request(`/api/chats/${id}`),
  deleteChat: (id) => request(`/api/chats/${id}`, { method: 'DELETE' }),
  sendMessage: (id, content, modelId) =>
    request(`/api/chats/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, modelId }),
    }),
  listAiModels: () => request('/api/ai-models'),
  getDefaultAiModel: () => request('/api/ai-models/default'),
  listGroupChats: () => request('/api/group-chats'),
  createGroupChat: (payload, opts) =>
    request('/api/group-chats', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipToast: true,
      ...opts,
    }),
  deleteGroupChat: (chatId) =>
    request(`/api/group-chats/${chatId}`, { method: 'DELETE' }),
  fetchGroupMessages: (chatId) => request(`/api/group-chats/${chatId}/messages`),
  sendGroupMessage: (chatId, payload) =>
    request(`/api/group-chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sendGroupTyping: (chatId, payload) =>
    request(`/api/group-chats/${chatId}/typing`, {
      method: 'POST',
      body: JSON.stringify(payload),
      silent: true,
    }),
  fetchOnlineUsers: () => request('/api/group-chats/presence/online'),
  setOnline: () =>
    request('/api/group-chats/presence/online', { method: 'POST', silent: true }),
  setOffline: () =>
    request('/api/group-chats/presence/offline', { method: 'POST', silent: true }),
  checkRealtimeHealth: () => request('/api/health/realtime'),
  getPublicConfig: () => request('/api/public/config'),
  adminListUsers: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/users?${query}`);
  },
  adminGetUserStats: (id) => request(`/api/admin/users/${id}/stats`),
  adminUpdateUserRole: (id, role) =>
    request(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  adminUpdateUserStatus: (id, isActive) =>
    request(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  adminBulkUpdateUserStatus: (userIds, isActive) =>
    request('/api/admin/users/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ userIds, isActive }),
    }),
  adminForcePasswordReset: (id) =>
    request(`/api/admin/users/${id}/force-password-reset`, { method: 'POST' }),
  adminListSettings: () => request('/api/admin/settings'),
  adminUpdateSetting: (key, value) =>
    request(`/api/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
      skipToast: true,
    }),
  adminTestPusher: () =>
    request('/api/admin/settings/test-pusher', { method: 'POST', skipToast: true }),
  adminListModels: () => request('/api/admin/models'),
  adminCreateModel: (payload) =>
    request('/api/admin/models', { method: 'POST', body: JSON.stringify(payload), skipToast: true }),
  adminUpdateModel: (id, payload) =>
    request(`/api/admin/models/${id}`, { method: 'PUT', body: JSON.stringify(payload), skipToast: true }),
  adminDeactivateModel: (id) =>
    request(`/api/admin/models/${id}/deactivate`, { method: 'PATCH' }),
  adminTestModel: (id) =>
    request(`/api/admin/models/${id}/test`, { method: 'POST', skipToast: true }),
};
