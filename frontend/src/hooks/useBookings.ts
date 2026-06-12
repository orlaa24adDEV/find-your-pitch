import { useState, useEffect, useCallback } from "react";
import { Booking } from "../interfaces/Booking";
import { getMyBookings, cancelBooking } from "../services/booking.service";

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyBookings(p, 10);
      setBookings(result.data || result);
      setPage(result.page || 1);
      setTotalPages(result.totalPages || 1);
    } catch {
      setError("Error al cargar tus reservas");
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (id: number) => {
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch {
      setError("Error al cancelar la reserva");
    }
  }, []);

  useEffect(() => {
    fetchBookings(page);
  }, [page, fetchBookings]);

  return { bookings, loading, error, cancel, page, totalPages, goToPage: setPage, refetch: () => fetchBookings(page) };
};
