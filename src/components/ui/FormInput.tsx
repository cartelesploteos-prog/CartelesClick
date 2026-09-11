import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  name, 
  label, 
  type = 'text', 
  placeholder,
  autoComplete,
  id
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `form-input-${name}`;

  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          {...register(name)}
          id={inputId}
          type={effectiveType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full p-2.5 ${isPasswordField ? 'pr-10' : ''} rounded-[7px] border bg-[var(--bg-page)] text-sm text-[var(--text-primary)] transition-all focus:ring-1 focus:ring-primary ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-[var(--border-subtle)] focus:border-primary'
          }`}
        />
        {isPasswordField && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-rose-500 dark:text-rose-400 text-[11px] font-medium mt-1 flex items-center gap-1">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

