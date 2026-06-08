import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { cn } from "../../lib/utils";

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputRightElement?: React.ReactNode;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  className,
  inputRightElement,
}: FormInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label htmlFor={name} className='text-sm font-medium text-zinc-300'>
          {label}
        </label>
      )}
      <div className='relative'>
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
          className={cn(
            "w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-zinc-700 hover:border-zinc-600",
            inputRightElement && "pr-10",
            className,
          )}
        />
        {inputRightElement && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            {inputRightElement}
          </div>
        )}
      </div>
      {error && (
        <p className='text-xs text-red-400'>{error.message as string}</p>
      )}
    </div>
  );
}
