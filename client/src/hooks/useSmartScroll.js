import { useCallback, useEffect, useRef } from 'react';

const BOTTOM_THRESHOLD = 96;

export function useSmartScroll(deps = []) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const updateStickiness = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance <= BOTTOM_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    if (stickToBottomRef.current) {
      scrollToBottom('smooth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    containerRef,
    bottomRef,
    onScroll: updateStickiness,
    scrollToBottom,
  };
}
