import { useEffect } from 'react';

const MODES = ['ai', 'team', 'admin'];

export function useAppMode(mode) {
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'home') {
      root.removeAttribute('data-mode');
      return;
    }
    const value = MODES.includes(mode) ? mode : 'ai';
    root.setAttribute('data-mode', value);
    return () => {
      root.removeAttribute('data-mode');
    };
  }, [mode]);
}
