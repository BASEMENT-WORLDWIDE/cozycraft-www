import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type InputProps = {
  label: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, label, ...props }, ref) => {
    return (
      <div className="relative rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
        <label
          htmlFor={name}
          className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900"
        >
          {label}
        </label>
        <input
          ref={ref}
          name={name}
          id={name}
          className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "InputForwardedRef";
