import { useState, useEffect, useCallback, useRef } from "react";
import { Field } from "../interfaces/Field";
import { getFields, searchFields, FieldFilters } from "../services/fields.service";

export const useFields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const queryRef = useRef("");
  const filtersRef = useRef<FieldFilters>({});

  const fetchPage = useCallback(async (p: number, q?: string, filters?: FieldFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = q && q.trim()
        ? await searchFields(q, p, 12, filters)
        : await getFields(p, 12, filters);
      setFields(result.data);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setError("Error al cargar los campos");
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (q: string) => {
    queryRef.current = q;
    setPage(1);
    await fetchPage(1, q, filtersRef.current);
  }, [fetchPage]);

  const setFilters = useCallback(async (filters: FieldFilters) => {
    filtersRef.current = filters;
    setPage(1);
    await fetchPage(1, queryRef.current, filters);
  }, [fetchPage]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  useEffect(() => {
    fetchPage(page, queryRef.current, filtersRef.current);
  }, [page, fetchPage]);

  return { fields, loading, error, search, setFilters, page, totalPages, total, goToPage };
};
