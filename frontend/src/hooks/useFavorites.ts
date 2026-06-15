import { useState, useCallback } from "react";
import { Field } from "../interfaces/Field";
import { toggleFavorite, getFavorites } from "../services/favorites.service";

export const useFavorites = () => {
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [favFields, setFavFields] = useState<Field[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [favPage, setFavPage] = useState(1);
  const [favTotalPages, setFavTotalPages] = useState(1);

  const syncFavIds = useCallback((fields: Field[]) => {
    setFavIds(new Set(fields.filter((f) => f.favorited).map((f) => f.id)));
  }, []);

  const fetchFavFields = useCallback(async (p: number) => {
    setLoadingFavs(true);
    try {
      const result = await getFavorites(p, 12);
      setFavFields(result.data);
      setFavPage(result.page);
      setFavTotalPages(result.totalPages);
    } catch {
      // ignore
    } finally {
      setLoadingFavs(false);
    }
  }, []);

  const toggle = useCallback(async (fieldId: number) => {
    const prev = favIds.has(fieldId);
    setFavIds((prevSet) => {
      const next = new Set(prevSet);
      if (prev) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
    try {
      const result = await toggleFavorite(fieldId);
      if (!result.favorited) {
        setFavFields((prev) => prev.filter((f) => f.id !== fieldId));
      } else {
        fetchFavFields(favPage);
      }
    } catch {
      setFavIds((prevSet) => {
        const next = new Set(prevSet);
        if (prev) next.add(fieldId);
        else next.delete(fieldId);
        return next;
      });
    }
  }, [favIds, fetchFavFields, favPage]);

  const isFavorite = useCallback((id: number) => favIds.has(id), [favIds]);

  return {
    favIds,
    favFields,
    loadingFavs,
    favPage,
    favTotalPages,
    syncFavIds,
    fetchFavFields,
    toggle,
    isFavorite,
    goToFavPage: setFavPage,
  };
};
