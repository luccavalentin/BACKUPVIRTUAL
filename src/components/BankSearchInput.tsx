import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { brazilianBanks, searchBanks, Bank } from "@/data/brazilianBanks";
import { Building2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onNewBank?: (bankName: string) => void;
  placeholder?: string;
}

export function BankSearchInput({ value, onChange, onNewBank, placeholder = "Buscar banco ou IF..." }: BankSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showNewBankDialog, setShowNewBankDialog] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedBank = brazilianBanks.find(b => b.name === value || `${b.code} - ${b.name}` === value);
  const filteredBanks = searchBanks(searchQuery);
  // Mostra resultados quando está aberto e há busca (mostra sugestões enquanto digita)
  const showResults = isOpen && searchQuery.length > 0;
  
  // Valor exibido no input: mostra o que está sendo digitado OU o banco selecionado
  const displayValue = searchQuery.length > 0 ? searchQuery : (selectedBank ? `${selectedBank.code} - ${selectedBank.name}` : value);

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

  const handleSelectBank = (bank: Bank) => {
    onChange(bank.name);
    setSearchQuery(""); // Limpa a busca para mostrar o banco selecionado
    setIsOpen(false);
  };

  const handleNewBank = () => {
    if (newBankName.trim()) {
      onChange(newBankName.trim());
      if (onNewBank) {
        onNewBank(newBankName.trim());
      }
      setNewBankName("");
      setShowNewBankDialog(false);
      setIsOpen(false);
    }
  };

  const getBankLogoUrl = (bank: Bank) => {
    // Usa o logo diretamente do banco se disponível
    if (bank.logo) {
      return bank.logo;
    }
    // Fallback: repositório GitHub com logos de bancos brasileiros
    const bankCode = bank.code.padStart(3, '0');
    return `https://raw.githubusercontent.com/guibranco/BancosBrasileiros/main/logos/${bankCode}.svg`;
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
                  if (selectedBank && inputValue !== `${selectedBank.code} - ${selectedBank.name}`) {
                    onChange("");
                  }
                  // Se o campo está vazio, limpa tudo
                  if (!inputValue) {
                    onChange("");
                  }
                }}
                onFocus={(e) => {
                  setIsOpen(true);
                  // Se há um banco selecionado, permite editar mostrando o nome
                  if (selectedBank && !searchQuery) {
                    setSearchQuery(selectedBank.name);
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
                title={selectedBank && !searchQuery ? selectedBank.name : undefined}
              />
            </TooltipTrigger>
            {selectedBank && !searchQuery && (
              <TooltipContent side="top" className="max-w-md">
                <p className="break-words">{selectedBank.name}</p>
                {selectedBank.shortName && selectedBank.shortName !== selectedBank.name && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedBank.shortName}</p>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        {(selectedBank || searchQuery) && (
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
          {searchQuery.length > 0 && filteredBanks.length > 0 ? (
            <>
              <div className="p-2 space-y-1">
                <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                  {filteredBanks.length} {filteredBanks.length === 1 ? 'instituição encontrada' : 'instituições encontradas'}
                </div>
                {filteredBanks.slice(0, 20).map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => handleSelectBank(bank)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                      selectedBank?.code === bank.code && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border relative mt-0.5">
                      <img
                        src={getBankLogoUrl(bank)}
                        alt={bank.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                      <Building2 className="w-5 h-5 text-muted-foreground hidden logo-fallback" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="font-medium break-words leading-snug text-sm">{bank.name}</div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span>{bank.code}</span>
                        <span>•</span>
                        <span>{bank.type}</span>
                        {bank.shortName && bank.shortName !== bank.name && (
                          <>
                            <span>•</span>
                            <span className="italic">{bank.shortName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <Dialog open={showNewBankDialog} onOpenChange={setShowNewBankDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar Novo Banco/IF
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Banco/IF</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newBankName">Nome do Banco/IF</Label>
                        <Input
                          id="newBankName"
                          value={newBankName}
                          onChange={(e) => setNewBankName(e.target.value)}
                          placeholder="Ex: Banco Exemplo S.A."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNewBank();
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewBankDialog(false);
                            setNewBankName("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNewBank}
                          disabled={!newBankName.trim()}
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
              <p className="mb-2">Nenhum banco encontrado</p>
              <Dialog open={showNewBankDialog} onOpenChange={setShowNewBankDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Novo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Banco/IF</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newBankName">Nome do Banco/IF</Label>
                      <Input
                        id="newBankName"
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        placeholder="Ex: Banco Exemplo S.A."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNewBank();
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewBankDialog(false);
                          setNewBankName("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNewBank}
                        disabled={!newBankName.trim()}
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
