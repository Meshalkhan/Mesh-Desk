import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupBodySchema, loginBodySchema } from 'meshdesk-shared';
import { Button } from './ui/Button.jsx';
import { Spinner } from './ui/Spinner.jsx';
import { FormField } from './ui/FormField.jsx';
import { Input } from './ui/Input.jsx';
import { PasswordInput } from './ui/PasswordInput.jsx';
import { applyValidationErrors } from '../lib/validationErrors.js';
import { MeshDeskMark } from './brand/MeshDeskWordmark.jsx';

export function AuthPanel({
  mode,
  error,
  isSubmitting,
  onSubmit,
  onToggleMode,
}) {
  const isSignup = mode === 'signup';
  const schema = isSignup ? signupBodySchema : loginBodySchema;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isSignup
      ? { username: '', email: '', password: '' }
      : { email: '', password: '' },
  });

  useEffect(() => {
    reset(isSignup ? { username: '', email: '', password: '' } : { email: '', password: '' });
  }, [isSignup, reset]);

  const passwordValue = watch('password', '');

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      if (err.fields) {
        applyValidationErrors(setError, err.fields);
      }
    }
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col justify-between overflow-hidden bg-surface p-8 md:p-12 lg:border-r lg:border-border-subtle">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(rgb(var(--accent-ai) / 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgb(var(--accent-team) / 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <MeshDeskMark size="lg" />
            <span className="text-display text-ink">MeshDesk</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="text-display text-ink">One desk for AI support and team chat.</p>
          <p className="mt-4 text-body text-ink-muted">
            Help customers with an assistant that remembers context. Coordinate with your team in
            real time — same login, two modes.
          </p>
          <div className="mt-8 flex gap-6 text-meta text-ink-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-ai" aria-hidden="true" />
              AI Support
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-team" aria-hidden="true" />
              Team Chat
            </span>
          </div>
        </div>
        <p className="relative text-meta-subtle text-ink-subtle">Internal workspace</p>
      </div>

      <div className="flex items-center justify-center bg-neutral-bg p-6 md:p-10">
        <form onSubmit={submit} noValidate className="w-full max-w-md space-y-5">
          <div>
            <h2 className="text-heading text-ink">
              {isSignup ? 'Create your account' : 'Sign in to MeshDesk'}
            </h2>
            <p className="mt-1 text-body text-ink-muted">
              {isSignup
                ? 'First account on a fresh workspace becomes admin.'
                : 'Use your workspace email and password.'}
            </p>
          </div>

          {isSignup && (
            <FormField label="Username" htmlFor="username" error={errors.username?.message}>
              <Input
                id="username"
                disabled={isSubmitting}
                hasError={Boolean(errors.username)}
                {...register('username')}
              />
            </FormField>
          )}

          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              hasError={Boolean(errors.email)}
              {...register('email')}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              disabled={isSubmitting}
              hasError={Boolean(errors.password)}
              showStrength={isSignup}
              value={passwordValue}
              {...register('password')}
            />
          </FormField>

          {error ? <p className="text-body text-danger">{error}</p> : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full !bg-ink !text-surface hover:!bg-ink-muted"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                {isSignup ? 'Creating account…' : 'Signing in…'}
              </span>
            ) : isSignup ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={onToggleMode}
            className="w-full"
          >
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </Button>
        </form>
      </div>
    </div>
  );
}
