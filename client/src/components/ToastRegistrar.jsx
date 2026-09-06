import { useEffect } from 'react';
import { registerToastHandlers } from '../lib/toastBridge.js';
import { useToast } from '../hooks/useToast.jsx';

export function ToastRegistrar() {
  const toast = useToast();

  useEffect(() => {
    registerToastHandlers({
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    });
  }, [toast]);

  return null;
}
