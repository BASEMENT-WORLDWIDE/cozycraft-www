import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";
import { useInterval } from "~/useInterval";

type DelayedButtonProps = {
  waitFor: number;
  children?: (ctx: { count: number; isRunning: boolean }) => ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const DelayedButton = forwardRef<HTMLButtonElement, DelayedButtonProps>(
  ({ children, waitFor, ...props }, ref) => {
    const [count, setCount] = useState(waitFor);
    const [isRunning, setRunning] = useState(true);
    useInterval(
      () => {
        let nextCount = count - 1000;
        setCount(nextCount);
        if (nextCount <= 0) {
          setRunning(false);
        }
      },
      isRunning ? 1000 : null
    );
    return (
      <button ref={ref} {...props} disabled={count > 0}>
        {children ? children({ count: count / 1000, isRunning }) : null}
      </button>
    );
  }
);

DelayedButton.displayName = "ForwaredRefDelayedButton";
