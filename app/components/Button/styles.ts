import { cva } from "cva";

export const buttonStyles = cva(
  "inline-flex items-center rounded-lg border border-transparent font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      size: {
        xs: ["px-2.5 py-1.5 text-xs"],
        sm: ["px-3 py-2 text-sm leading-4"],
        md: ["px-4 py-2 text-sm"],
        lg: ["px-4 py-2 text-base"],
        xl: ["px-6 py-3 text-base"],
      },
      intent: {
        success: ["bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"],
        danger: ["bg-cerise-600 hover:bg-cerise-700 focus:ring-cerise-500"],
        warning: ["bg-gold-600 hover:bg-gold-700 focus:ring-gold-500"],
        info: ["bg-navy-600 hover:bg-navy-700 focus:ring-navy-500"],
        default: ["bg-slate-600 hover:bg-slate-700 focus:ring-slate-500"],
      },
    },
    compoundVariants: [],
    defaultVariants: {
      intent: "default",
      size: "md",
    },
  }
);
