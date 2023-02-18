import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type InputProps = {
  label: ReactNode;
  subLabel?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, label, subLabel, className, ...props }, ref) => {
    return (
      <>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1.5">
          <input
            ref={ref}
            name={name}
            id={name}
            className={clsx(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
              className
            )}
            {...props}
          />
        </div>
        {subLabel && <p className="mt-2 text-sm text-gray-500">{subLabel}</p>}
      </>
    );
  }
);

Input.displayName = "InputForwardedRef";
