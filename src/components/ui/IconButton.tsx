import * as React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: "edit" | "delete" | "default";
  className?: string;
  'aria-label'?: string;
  title?: string;
}

export function IconButton({ icon: Icon, onClick, variant = "default", className, 'aria-label': ariaLabel, title, ...props }: IconButtonProps) {
  const variantStyles = {
    edit: "hover:bg-primary/10 hover:text-primary",
    delete: "hover:bg-destructive/10 hover:text-destructive",
    default: "hover:bg-muted",
  };

  const ariaLabels = {
    edit: "Editar",
    delete: "Excluir",
    default: "Ação",
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={ariaLabel || ariaLabels[variant]}
      title={title || ariaLabels[variant]}
      className={cn(
        "transition-all duration-200 group",
        variantStyles[variant],
        className
      )}
    >
      <Icon 
        className={cn(
          "w-4 h-4 icon-professional group-hover:scale-110 transition-transform duration-200",
          variant === "edit" && "group-hover:rotate-12",
          variant === "delete" && "group-hover:rotate-12"
        )} 
        strokeWidth={2.5} 
      />
    </Button>
  );
}

