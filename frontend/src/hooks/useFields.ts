import { useState, useEffect, useCallback, useRef } from "react";
import { Field } from "../interfaces/Field";
import { getFields, searchFields } from "../services/fields.service";

export const useFields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const queryRef = useRef("");

  const fetchPage = useCallback(async (p: number, q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = q && q.trim()
        ? await searchFields(q, p)
        : await getFields(p);
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
    await fetchPage(1, q);
  }, [fetchPage]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  useEffect(() => {
    fetchPage(page, queryRef.current);
  }, [page, fetchPage]);

  return { fields, loading, error, search, page, totalPages, total, goToPage };
};
