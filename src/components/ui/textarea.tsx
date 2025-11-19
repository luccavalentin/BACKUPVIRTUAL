import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border-2 border-input/70 bg-background px-4 py-3 text-[15px] font-normal leading-relaxed text-foreground ring-offset-background placeholder:text-muted-foreground/60 placeholder:font-normal placeholder:tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:border-primary focus-visible:shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 resize-y hover:border-input/90",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
