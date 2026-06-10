import { useState, useEffect, useCallback } from "react";
import { Booking } from "../interfaces/Booking";
import { getMyBookings, cancelBooking } from "../services/booking.service";

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      setBookings(data);
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
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, cancel, refetch: fetchBookings };
};
