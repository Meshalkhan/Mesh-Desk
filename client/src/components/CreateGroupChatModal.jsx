import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGroupChatBodySchema } from 'meshdesk-shared';
import { Modal } from './ui/Modal.jsx';
import { Button } from './ui/Button.jsx';
import { FormField } from './ui/FormField.jsx';
import { Input } from './ui/Input.jsx';
import { applyValidationErrors } from '../lib/validationErrors.js';
import { ApiError } from '../services/api.js';

export function CreateGroupChatModal({ isOpen, users, onlineUsers, onCreate, onClose }) {
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGroupChatBodySchema),
    defaultValues: { name: '', participants: [] },
  });

  const selectedIds = watch('participants') || [];

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;
    return users.filter((user) => user.username.toLowerCase().includes(normalizedQuery));
  }, [query, users]);

  const toggleSelection = (userId) => {
    const next = selectedIds.includes(userId)
      ? selectedIds.filter((entry) => entry !== userId)
      : [...selectedIds, userId];
    setValue('participants', next, { shouldValidate: true });
  };

  const handleClose = () => {
    reset({ name: '', participants: [] });
    setQuery('');
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await onCreate(values);
      reset({ name: '', participants: [] });
      setQuery('');
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        applyValidationErrors(setError, err.fields);
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal open={isOpen} onClose={handleClose} title="Create group chat" size="lg">
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <FormField label="Conversation name" htmlFor="group-name" error={errors.name?.message}>
          <Input
            id="group-name"
            placeholder="Conversation name"
            hasError={Boolean(errors.name)}
            disabled={submitting}
            {...register('name')}
          />
        </FormField>

        <Input
          placeholder="Search users…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={submitting}
          aria-label="Search users"
        />

        <div className="max-h-48 space-y-1 overflow-y-auto scroll-thin rounded-xl border border-border-subtle/60 p-2">
          {filteredUsers.map((user) => (
            <label
              key={user._id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 motion-safe hover:bg-surface-muted"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(user._id)}
                onChange={() => toggleSelection(user._id)}
                disabled={submitting}
              />
              <span
                className={`h-2 w-2 rounded-full ${
                  onlineUsers.includes(user.username) ? 'bg-success' : 'bg-ink-subtle/40'
                }`}
                aria-hidden="true"
              />
              <span className="text-sm text-ink">{user.username}</span>
              <span className="text-xs text-ink-muted">{user.email}</span>
            </label>
          ))}
          {filteredUsers.length === 0 && (
            <p className="px-2 py-4 text-sm text-ink-muted">No matching users found.</p>
          )}
        </div>
        {errors.participants?.message && (
          <p className="text-xs text-danger" role="alert">
            {errors.participants.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} loading={submitting}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
