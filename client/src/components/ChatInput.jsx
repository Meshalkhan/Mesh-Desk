import { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { messageContentSchema } from 'meshdesk-shared';
import { Button } from './ui/Button.jsx';
import { FieldError } from './ui/FieldError.jsx';
import { inputClass } from './ui/inputStyles.js';

const chatInputSchema = z.object({
  content: messageContentSchema,
});

export function ChatInput({ onSend, disabled, placeholder, onTypingStart, onTypingStop }) {
  const textareaRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { content: '' },
  });

  const { ref: registerRef, ...contentField } = register('content');

  const submit = handleSubmit(async ({ content }) => {
    await onSend(content);
    reset({ content: '' });
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onTypingStop?.();
  });

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const onInput = useCallback(
    (e) => {
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
      if (el.value.trim()) {
        onTypingStart?.();
      } else {
        onTypingStop?.();
      }
    },
    [onTypingStart, onTypingStop],
  );

  return (
    <div className="border-t border-border-subtle/60 bg-surface-muted/40 p-4 backdrop-blur-sm dark:bg-surface-muted/30">
      <form onSubmit={submit} noValidate className="mx-auto flex max-w-4xl flex-col gap-1">
        <div className="flex gap-2">
          <textarea
            {...contentField}
            ref={(el) => {
              registerRef(el);
              textareaRef.current = el;
            }}
            rows={1}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={onKeyDown}
            onInput={onInput}
            className={`max-h-40 min-h-[44px] flex-1 resize-none shadow-sm ${inputClass(Boolean(errors.content))}`}
          />
          <Button type="submit" disabled={disabled} className="shrink-0">
            Send
          </Button>
        </div>
        <FieldError message={errors.content?.message} />
      </form>
    </div>
  );
}
