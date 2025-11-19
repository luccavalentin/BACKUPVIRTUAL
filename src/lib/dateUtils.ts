import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data no formato brasileiro (dd/MM/yyyy)
 */
export const formatDateBR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
};

/**
 * Formata uma data no formato brasileiro curto (dd/MM/yy)
 */
export const formatDateShortBR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yy", { locale: ptBR });
};

/**
 * Formata uma data com hora no formato brasileiro
 */
export const formatDateTimeBR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * Retorna a distância relativa de uma data até agora em português
 */
export const formatRelativeTimeBR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
};

/**
 * Formata uma data no formato completo brasileiro
 */
export const formatDateFullBR = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

