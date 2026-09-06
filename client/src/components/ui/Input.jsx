import { forwardRef } from 'react';
import { inputClass } from './inputStyles.js';

export const Input = forwardRef(function Input({ hasError, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${inputClass(hasError)} ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ hasError, className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${inputClass(hasError)} ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ hasError, className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`${inputClass(hasError)} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
