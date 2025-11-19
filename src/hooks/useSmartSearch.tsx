import { useState, useMemo } from "react";

/**
 * Hook inteligente de busca que filtra dados em múltiplas colunas
 * @param data - Array de dados para filtrar
 * @param searchableFields - Array de chaves dos campos que devem ser pesquisáveis
 * @returns Objeto com searchTerm, setSearchTerm e filteredData
 */
export function useSmartSearch<T extends Record<string, any>>(
  data: T[] | undefined,
  searchableFields: (keyof T)[]
) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!data || !searchTerm.trim()) return data;

    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    return data.filter((item) => {
      return searchableFields.some((field) => {
        const value = item[field];
        
        if (value === null || value === undefined) return false;
        
        // Converte para string e normaliza
        const normalizedValue = String(value)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        // Busca parcial (contém)
        return normalizedValue.includes(normalizedSearch);
      });
    });
  }, [data, searchTerm, searchableFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    resultCount: filteredData?.length || 0,
    totalCount: data?.length || 0,
  };
}

