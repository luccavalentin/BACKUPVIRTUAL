import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { brazilianStates, searchStates, State } from "@/data/brazilianStates";
import { MapPin, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onNewState?: (stateName: string) => void;
  placeholder?: string;
}

export function StateSearchInput({ value, onChange, onNewState, placeholder = "Buscar estado..." }: StateSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showNewStateDialog, setShowNewStateDialog] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tenta encontrar o estado pelo nome completo ou formato "Nome (UF)"
  const selectedState = brazilianStates.find(
    s => s.name === value || 
    `${s.name} (${s.code})` === value ||
    value.includes(s.name) ||
    value.includes(s.code)
  );
  const filteredStates = searchStates(searchQuery);
  // Mostra resultados quando está aberto e há busca
  const showResults = isOpen && searchQuery.length > 0;
  
  // Valor exibido no input: mostra o que está sendo digitado OU o estado selecionado
  const displayValue = searchQuery.length > 0 
    ? searchQuery 
    : (selectedState ? `${selectedState.name} (${selectedState.code})` : value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectState = (state: State) => {
    onChange(`${state.name} (${state.code})`);
    setSearchQuery(""); // Limpa a busca para mostrar o estado selecionado
    setIsOpen(false);
  };

  const handleNewState = () => {
    if (newStateName.trim()) {
      onChange(newStateName.trim());
      if (onNewState) {
        onNewState(newStateName.trim());
      }
      setNewStateName("");
      setShowNewStateDialog(false);
      setIsOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative w-full">
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Input
                ref={inputRef}
                type="text"
                value={displayValue}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setSearchQuery(inputValue);
                  setIsOpen(true);
                  // Se o usuário está digitando, limpa a seleção anterior
                  if (selectedState && inputValue !== `${selectedState.name} (${selectedState.code})`) {
                    onChange("");
                  }
                  // Se o campo está vazio, limpa tudo
                  if (!inputValue) {
                    onChange("");
                  }
                }}
                onFocus={(e) => {
                  setIsOpen(true);
                  // Se há um estado selecionado, permite editar mostrando o nome
                  if (selectedState && !searchQuery) {
                    setSearchQuery(selectedState.name);
                    // Seleciona todo o texto para facilitar a edição
                    setTimeout(() => {
                      e.target.select();
                    }, 0);
                  }
                }}
                placeholder={placeholder}
                className="w-full"
                style={{ 
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                title={selectedState && !searchQuery ? `${selectedState.name} (${selectedState.code})` : undefined}
              />
            </TooltipTrigger>
            {selectedState && !searchQuery && (
              <TooltipContent side="top" className="max-w-md">
                <p className="break-words">{selectedState.name} ({selectedState.code})</p>
              </TooltipContent>
            )}
          </Tooltip>
        {(selectedState || searchQuery) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => {
              onChange("");
              setSearchQuery("");
              setIsOpen(false);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {searchQuery.length > 0 && filteredStates.length > 0 ? (
            <>
              <div className="p-2 space-y-1">
                <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                  {filteredStates.length} {filteredStates.length === 1 ? 'estado encontrado' : 'estados encontrados'}
                </div>
                {filteredStates.slice(0, 27).map((state) => (
                  <button
                    key={state.code}
                    type="button"
                    onClick={() => handleSelectState(state)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                      selectedState?.code === state.code && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border relative mt-0.5">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="font-medium break-words leading-snug text-sm">{state.name}</div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span>{state.code}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <Dialog open={showNewStateDialog} onOpenChange={setShowNewStateDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar Novo Estado
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Estado</DialogTitle>
                      <DialogDescription>
                        Preencha os dados para cadastrar um novo estado.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newStateName">Nome do Estado</Label>
                        <Input
                          id="newStateName"
                          value={newStateName}
                          onChange={(e) => setNewStateName(e.target.value)}
                          placeholder="Ex: Estado Exemplo"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNewState();
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewStateDialog(false);
                            setNewStateName("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNewState}
                          disabled={!newStateName.trim()}
                        >
                          Cadastrar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p className="mb-2">Nenhum estado encontrado</p>
              <Dialog open={showNewStateDialog} onOpenChange={setShowNewStateDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Novo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Estado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newStateName">Nome do Estado</Label>
                      <Input
                        id="newStateName"
                        value={newStateName}
                        onChange={(e) => setNewStateName(e.target.value)}
                        placeholder="Ex: Estado Exemplo"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNewState();
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewStateDialog(false);
                          setNewStateName("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNewState}
                        disabled={!newStateName.trim()}
                      >
                        Cadastrar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}



