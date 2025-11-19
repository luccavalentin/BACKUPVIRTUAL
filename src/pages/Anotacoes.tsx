import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput } from "@/lib/validations";
import { StatsCard } from "@/components/layout/StatsCard";

export default function Anotacoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const { data: notes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [keepDialogOpen, setKeepDialogOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("notes").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Anotação criada com sucesso!" });
      if (keepDialogOpen) {
        setFormData({ content: "" });
        setKeepDialogOpen(false);
      } else {
      handleCloseDialog();
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("notes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Anotação atualizada com sucesso!" });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Anotação excluída com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir anotação",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleStrikethroughMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("notes")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar anotação",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDoubleClick = (note: any) => {
    const currentCompleted = note.completed ?? false;
    const newCompleted = !currentCompleted;
    toggleStrikethroughMutation.mutate({ id: note.id, completed: newCompleted });
  };

  const handleSubmitAndNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeepDialogOpen(true);
    const data = {
      ...formData,
      title: standardizeText(formData.title),
      content: formData.content ? standardizeText(formData.content) : null,
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeepDialogOpen(false);
    const data = {
      ...formData,
      title: standardizeText(formData.title),
      content: formData.content ? standardizeText(formData.content) : null,
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      content: note.content || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
    });
    setIsDialogOpen(true);
  };

  const handleCadastrarNovasAnotacoes = async () => {
    const novasAnotacoes = [
      {
        title: "Processo Trabalhista Eliana",
        content: "Cuidados: Perda de prazo, cumprimento de publicações, atos do processo, não perder audiência"
      },
      {
        title: "Retorno - Repasse De Clientes",
        content: "Ação necessária: Retomar repasse de clientes"
      },
      {
        title: "Pagamento E Acompanhamento",
        content: "Pagar a diferença para o Carlinho\n\nVer com o João a quantidade de bezerro: 6 bezerros"
      },
      {
        title: "Eliana Mato Grosso - Prestação De Contas",
        content: "Atualizar contas da Eliana\n\nArgumentos para acerto de contas:\n\nPrimeiro ano: compra de bezerras\n\nDois anos para criar o gado\n\nDificuldade de localizar o gado\n\nBezerros tratados com silagem\n\nInvestimentos realizados na propriedade:"
      },
      {
        title: "Investimentos Realizados Na Fazenda",
        content: "Reforma de cercas na divisa com soja (até eucalipto)\n\nMateriais: arame, lasca, mão de obra, óleo diesel\n\nLimpeza de mato around das cercas com lâmina\n\nEstradas de acesso (Morro do Chapéu)\n\nLimpeza de estradas até cachoeira pela lateral\n\nLimpeza de pasto na Furna\n\nLimpeza com correntão no pasto ao lado do Morro do Chapéu\n\nLimpeza para reforma de cercas\n\nCaminho de acesso até divisa com terra da pensão seca\n\nReforma do curral (telhado caído, madeiras podres)\n\nNovo mangueiro no pasto de cima\n\nCalcário e semeadura de pastos para maternidade\n\nManutenção do barracão (tesouras)\n\nTroca de bomba do poço\n\nReforma de encanamento da sede\n\nPintura e reforma das casas (troca de telhas)"
      },
      {
        title: "Infraestrutura Atual",
        content: "Precisa de óleo diesel mensal\n\nDois tratores grandes\n\nDois funcionários\n\nReforma de veículos (F-4000, bicos, bomba injetora)\n\nGradeamento na divisa com sem-terra (prevenção de fogo por 3 anos)\n\nResultado: Fazenda agora tem estradas e cercas"
      },
      {
        title: "Análise Da Situação Atual",
        content: "Estudo sobre troca de fazenda\n\nNecessidade de certeza sobre investimentos necessários\n\nImportância do apoio do dono da terra\n\nCusto alto de manutenção: trato além do capim, moer milho, reparos, limpeza de pasto\n\nPressão por reajustes de valores\n\nDecisão: Necessidade de entregar o Rio Verde se custos não reduzirem\n\nDificuldade de tocar dois lugares sem ajuda\n\nRetirada de dinheiro próprio para cobrir custos"
      },
      {
        title: "Observações Finais",
        content: "Bicho\n\nHerança do pai e mãe"
      }
    ];

    let sucesso = 0;
    let erros = 0;
    let duplicados = 0;

    for (const anotacao of novasAnotacoes) {
      const tituloPadronizado = standardizeText(anotacao.title);
      const conteudoPadronizado = anotacao.content ? standardizeText(anotacao.content) : null;
      
      try {
        // Verifica se já existe uma anotação com o mesmo título (case-insensitive)
        const { data: existing } = await supabase
          .from("notes")
          .select("id")
          .ilike("title", tituloPadronizado)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`⚠️ Anotação "${tituloPadronizado}" já existe, pulando...`);
          duplicados++;
          continue;
        }

        const { error } = await supabase
          .from("notes")
          .insert([{
            title: tituloPadronizado,
            content: conteudoPadronizado
          }]);

        if (error) {
          console.log(`❌ Erro ao cadastrar "${anotacao.title}": ${error.message}`);
          erros++;
        } else {
          console.log(`✅ Anotação "${tituloPadronizado}" cadastrada com sucesso`);
          sucesso++;
        }
      } catch (error: any) {
        console.log(`❌ Erro ao cadastrar "${anotacao.title}": ${error.message || error}`);
        erros++;
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    await queryClient.invalidateQueries({ queryKey: ["notes"] });
    
    toast({
      title: "Cadastro concluído",
      description: `${sucesso} anotação(ões) cadastrada(s) com sucesso. ${erros} erro(s).`,
      variant: erros > 0 ? "destructive" : "default",
    });
  };

  // Executa o cadastro das novas anotações automaticamente ao carregar (apenas uma vez)
  useEffect(() => {
    const hasExecuted = sessionStorage.getItem('anotacoes_cadastradas');
    if (!hasExecuted) {
      handleCadastrarNovasAnotacoes();
      sessionStorage.setItem('anotacoes_cadastradas', 'true');
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Anotações"
        description="Organize suas ideias e informações"
        action={{
          label: "Nova Anotação",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      <div className="mb-6">
        <StatsCard
          title="Total de Anotações"
          value={notes?.length?.toString() || "0"}
          icon={FileText}
          variant="default"
          onClick={() => setDetailsDialogOpen(true)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {notes?.map((note, index) => (
          <Card 
            key={note.id} 
            className={`
              border-2 border-primary/30 
              bg-gradient-to-br from-background to-muted/20
              shadow-lg hover:shadow-xl 
              hover:border-primary/60
              transition-all duration-300 
              cursor-pointer
              ${note.completed ? "opacity-60 grayscale" : ""}
              ${index % 2 === 0 ? "ring-2 ring-primary/10" : "ring-1 ring-border"}
              active:scale-[0.98]
            `}
            onDoubleClick={() => handleDoubleClick(note)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 border-b border-border/50">
              <CardTitle className={`text-lg font-bold text-foreground ${note.completed ? "line-through" : ""}`}>
                {note.title}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(note);
                  }}
                  aria-label="Editar anotação"
                  title="Editar anotação"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(note.id);
                  }}
                  aria-label="Excluir anotação"
                  title="Excluir anotação"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className={`text-sm text-foreground/80 mb-3 line-clamp-3 leading-relaxed ${note.completed ? "line-through" : ""}`}>
                {note.content || "Sem conteúdo"}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <p className="text-xs font-medium text-muted-foreground">
                  Atualizado em {format(new Date(note.updated_at), "dd/MM/yyyy 'às' HH:mm")}
                </p>
                {note.completed && (
                  <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded">
                    Concluída
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Anotação" : "Nova Anotação"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados da anotação abaixo." : "Preencha os dados para criar uma nova anotação."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, title: value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, content: value }))}
                rows={8}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              {!editingId && (
                <Button type="button" variant="outline" onClick={handleSubmitAndNew}>
                  Cadastrar Novo
                </Button>
              )}
              <Button type="submit">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes - Total de Anotações */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes - Total de Anotações</DialogTitle>
            <DialogDescription>
              Lista completa de todas as {notes?.length || 0} anotações cadastradas no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes?.map((note: any) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title || "-"}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{note.content || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={note.completed ? "default" : "secondary"}>
                        {note.completed ? "Concluída" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{note.created_at ? format(new Date(note.created_at), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
