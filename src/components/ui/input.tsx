import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onBlur, onKeyDown, ...props }, ref) => {
    const cancelNextBlurCommitRef = React.useRef(false);

    return (
      <input
        type={type}
        className={cn(
          "flex min-h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
        onKeyDown={(event) => {
          const shouldCancelBlurCommit = event.key === "Escape";
          if (shouldCancelBlurCommit) cancelNextBlurCommitRef.current = true;

          onKeyDown?.(event);

          if (shouldCancelBlurCommit && document.activeElement === event.currentTarget) {
            cancelNextBlurCommitRef.current = false;
          }
        }}
        onBlur={(event) => {
          if (cancelNextBlurCommitRef.current) {
            cancelNextBlurCommitRef.current = false;
            return;
          }
          onBlur?.(event);
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
