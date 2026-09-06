import { useEffect, useId, useRef, useState } from 'react';
import { ConfirmModal } from './Modal.jsx';

export function ConversationMenu({
  itemLabel = 'conversation',
  onDelete,
  className = '',
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const handleDelete = async () => {
    await onDelete?.();
    setConfirmOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <div className={`relative ${className}`} ref={rootRef}>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-meta text-ink-muted opacity-0 motion-safe hover:bg-surface-muted hover:text-ink focus:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={`Actions for this ${itemLabel}`}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          ···
        </button>
        {menuOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 min-w-[8rem] rounded-lg border border-border-subtle bg-surface-elevated py-1 shadow-md"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-body text-danger motion-safe hover:bg-danger-muted/40"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`Delete ${itemLabel}?`}
        description={`This ${itemLabel} and its messages will be removed permanently.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
