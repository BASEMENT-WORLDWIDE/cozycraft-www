import type { ReactNode } from "react";

type OnboardingSectionProps = {
  children?: ReactNode;
  title?: ReactNode;
};

export const OnboardingSection = ({
  children,
  title,
}: OnboardingSectionProps) => (
  <>
    <h1 className="text-4xl sm:text-5xl font-light break-words">{title}</h1>
    {children}
  </>
);
