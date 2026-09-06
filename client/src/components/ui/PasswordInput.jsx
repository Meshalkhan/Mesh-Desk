import { forwardRef } from 'react';
import { getPasswordStrength } from 'meshdesk-shared/passwordStrength';
import { Input } from './Input.jsx';

const STRENGTH_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-emerald-500',
];

export const PasswordInput = forwardRef(function PasswordInput(
  { value = '', onChange, hasError, showStrength = false, ...props },
  ref,
) {
  const strength = getPasswordStrength(value);

  return (
    <div>
      <Input
        ref={ref}
        type="password"
        value={value}
        onChange={onChange}
        hasError={hasError}
        {...props}
      />
      {showStrength && value.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1">
            {Array.from({ length: strength.maxScore }).map((_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index < strength.score ? STRENGTH_COLORS[strength.score] : 'bg-border-subtle/60'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-ink-muted">{strength.label}</p>
          <ul className="space-y-0.5">
            {strength.checks.map((check) => (
              <li
                key={check.id}
                className={`text-xs ${check.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted'}`}
              >
                {check.passed ? '✓' : '○'} {check.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
