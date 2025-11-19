import { Button } from "@/components/ui/button";
import { Plus, LucideIcon } from "lucide-react";
import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  showBackButton?: boolean;
}

export function PageHeader({ title, description, action, showBackButton = true }: PageHeaderProps) {
  if (!action) {
    return (
      <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 md:mb-10 relative w-full max-w-full px-2 sm:px-4">
        {showBackButton && (
          <div className="absolute left-2 sm:left-4 top-0 z-20">
            <BackButton />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="relative z-10 w-full max-w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-2 sm:mb-3 px-2">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium max-w-2xl px-4 leading-relaxed mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 sm:gap-5 mb-6 sm:mb-8 md:mb-10 relative w-full max-w-full px-2 sm:px-4">
      {showBackButton && (
        <div className="absolute left-2 sm:left-4 top-0 z-20">
          <BackButton />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-4xl w-full px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-2 sm:mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium leading-relaxed px-2">
            {description}
          </p>
        )}
      </div>
      <Button 
        onClick={action.onClick} 
        className="gap-2 shadow-elegant hover:shadow-elegant-lg transition-all duration-200 group w-full sm:w-auto rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold relative z-10"
        size="default"
      >
        {action.icon ? (
          <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
        ) : (
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
        )}
        <span className="hidden sm:inline">{action.label}</span>
        <span className="sm:hidden">{action.label.includes("PDF") ? "PDF" : "Novo"}</span>
      </Button>
    </div>
  );
}
