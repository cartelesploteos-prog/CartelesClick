import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ name, label, type = 'text', placeholder }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={`w-full p-2.5 rounded-[7px] border bg-[var(--bg-page)] text-sm transition-all focus:ring-1 focus:ring-primary ${
          error ? 'border-red-500' : 'border-[var(--border-subtle)]'
        }`}
      />
      {error && <p className="text-red-500 text-[10px] font-medium">{error}</p>}
    </div>
  );
};
