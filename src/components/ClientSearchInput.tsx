import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
}

interface ClientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  clients?: Client[];
  placeholder?: string;
  isLoading?: boolean;
  emptyStateAction?: React.ReactNode;
}

export function ClientSearchInput({
  value,
  onChange,
  clients,
  placeholder = "Selecione um cliente",
  isLoading = false,
  emptyStateAction,
}: ClientSearchInputProps) {
  const [open, setOpen] = useState(false);

  const selectedClient = useMemo(
    () => clients?.find((client) => client.id === value),
    [clients, value]
  );

  const clientsSorted = useMemo(() => {
    if (!clients) return [];
    return [...clients].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [clients]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-xl border-dashed text-left font-medium hover:border-primary/60"
          disabled={isLoading}
        >
          <span className="truncate">
            {selectedClient ? selectedClient.name : placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(360px,90vw)] p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder="Buscar por nome ou documento..." />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              <div className="space-y-3">
                <p>Nenhum cliente encontrado</p>
                {emptyStateAction}
              </div>
            </CommandEmpty>
            <CommandGroup heading="Clientes">
              {clientsSorted.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onChange(client.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 py-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{client.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

