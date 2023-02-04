import type { VariantProps } from "cva";
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { buttonStyles } from "./Button/styles";

type ButtonProps = VariantProps<typeof buttonStyles> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, intent, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonStyles({ className, intent, size })}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "ButtonForwardedRef";
