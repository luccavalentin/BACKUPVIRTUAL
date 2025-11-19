import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function useTableSort<T>(data: T[] | undefined) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!data || !sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        // Normaliza strings para ordenação alfabética (remove acentos e converte para minúsculas)
        const normalize = (str: string) => str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        const aNormalized = normalize(aValue);
        const bNormalized = normalize(bValue);
        
        return sortDirection === "asc"
          ? aNormalized.localeCompare(bNormalized, "pt-BR", { sensitivity: "base" })
          : bNormalized.localeCompare(aNormalized, "pt-BR", { sensitivity: "base" });
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const SortButton = ({ column, children }: { column: keyof T; children: React.ReactNode }) => {
    const isActive = sortKey === column;
    const Icon = !isActive ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;

    return (
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="h-8 px-2 lg:px-3 hover:bg-muted/50"
      >
        {children}
        <Icon className="ml-2 h-4 w-4" />
      </Button>
    );
  };

  return { sortedData, SortButton };
}
