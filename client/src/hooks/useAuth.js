import { useCallback, useEffect, useState } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from '../services/api.js';
import { AUTH_STORAGE_KEY } from '../shared/storage.js';

function loadStoredAuth() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const data = JSON.parse(stored);
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState(loadStoredAuth);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const persistAuth = useCallback((data) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    setAuthToken(data.token);
    setAuthState(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthToken(null);
    setAuthState(null);
    setAuthError('');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const handleAuthSubmit = useCallback(
    async (payload) => {
      setIsSubmitting(true);
      setAuthError('');
      try {
        const data =
          authMode === 'signup'
            ? await api.signup(payload)
            : await api.login({ email: payload.email, password: payload.password });
        persistAuth(data);
      } catch (error) {
        setAuthError(error.message || 'Authentication failed.');
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [authMode, persistAuth],
  );

  const initToken = useCallback(() => {
    if (authState?.token) {
      setAuthToken(authState.token);
    }
  }, [authState?.token]);

  return {
    authState,
    currentUser: authState?.user || null,
    authMode,
    setAuthMode,
    authError,
    isSubmitting,
    handleAuthSubmit,
    logout,
    initToken,
    isAuthenticated: Boolean(authState?.token),
  };
}
