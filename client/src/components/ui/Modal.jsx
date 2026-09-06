import { useEffect, useId, useRef } from 'react';
import { Button } from './Button.jsx';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  labelledBy,
}) {
  const fallbackId = useId();
  const titleId = labelledBy || `${fallbackId}-title`;
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.activeElement;
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 animate-modal-backdrop bg-surface-overlay/50 backdrop-blur-sm motion-safe"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? `${titleId}-desc` : undefined}
        className={`animate-modal-in relative z-10 w-full ${sizes[size] || sizes.md} rounded-2xl border border-border-subtle/70 bg-surface p-6 shadow-lg motion-safe`}
      >
        {title ? (
          <h2 id={titleId} className="text-heading text-ink">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p id={`${titleId}-desc`} className="mt-2 text-sm text-ink-muted">
            {description}
          </p>
        ) : null}
        {children ? <div className={title || description ? 'mt-4' : ''}>{children}</div> : null}
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading,
  destructive = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
