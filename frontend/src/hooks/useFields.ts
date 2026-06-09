import { useState, useEffect, useCallback } from "react";
import { Field } from "../interfaces/Field";
import { getFields, searchFields } from "../services/fields.service";

export const useFields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFields();
      setFields(data);
    } catch {
      setError("Error al cargar los campos");
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = q.trim() ? await searchFields(q) : await getFields();
      setFields(data);
    } catch {
      setError("Error al buscar campos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return { fields, loading, error, search };
};
