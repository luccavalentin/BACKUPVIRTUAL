import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      variant="outline"
      className="relative flex items-center gap-3 px-4 py-2 rounded-full border-2 border-primary/70 bg-gradient-to-r from-primary/10 via-secondary/20 to-background text-primary shadow-lg hover:shadow-xl transition-all duration-300"
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-inner">
        <Sun
          className={`absolute h-4 w-4 text-yellow-500 transition-all duration-300 ${
            isDark ? "opacity-0 -translate-y-1 rotate-90" : "opacity-100 translate-y-0 rotate-0"
          }`}
          strokeWidth={2.2}
        />
        <Moon
          className={`absolute h-4 w-4 text-blue-600 transition-all duration-300 ${
            isDark ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-1 rotate-90"
          }`}
          strokeWidth={2.2}
        />
      </div>
      <div className="flex flex-col leading-tight text-left">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70">Tema</span>
        <span className="text-xs font-bold text-primary">
          {isDark ? "Modo Escuro" : "Modo Claro"}
        </span>
      </div>
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

