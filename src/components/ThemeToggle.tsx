import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "light";
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-9 w-9 rounded-lg border border-border/50",
        "bg-background/80 backdrop-blur-sm",
        "hover:bg-accent hover:border-primary/50",
        "transition-all duration-200",
        "shadow-sm hover:shadow-md"
      )}
      onClick={toggleTheme}
      aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
      title={isDark ? "Modo Escuro" : "Modo Claro"}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 text-yellow-500 transition-all duration-300",
          isDark ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"
        )}
        strokeWidth={2}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 text-blue-500 transition-all duration-300",
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"
        )}
        strokeWidth={2}
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

