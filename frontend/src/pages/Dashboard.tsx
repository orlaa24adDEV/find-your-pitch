import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../hooks/useBookings";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";

const statusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return (
        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
          Confirmada
        </span>
      );
    case "cancelled":
      return (
        <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
          Cancelada
        </span>
      );
    default:
      return (
        <span className="bg-ink-100 text-ink-600 text-xs font-medium px-2.5 py-1 rounded-full">
          {status}
        </span>
      );
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { bookings, loading, error, cancel, page, totalPages, goToPage } = useBookings();
  const navigate = useNavigate();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    await cancel(cancelId);
    setCancelling(false);
    setCancelId(null);
  };

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">Mis reservas</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-5 bg-ink-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-ink-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-ink-100 rounded w-1/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Mis reservas</h1>
        {bookings.length > 0 && (
          <span className="text-sm text-ink-600">
            {bookings.length} reserva{bookings.length !== 1 && "s"}
          </span>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-600 text-lg mb-4">
            No tienes reservas
          </p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Explorar campos
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-ink">
                    {booking.field?.name || `Campo #${booking.fieldId}`}
                  </h3>
                  {statusBadge(booking.status)}
                </div>
                <p className="text-sm text-ink-600">
                  {formatDate(booking.date)} &middot; {booking.startTime} - {booking.endTime}
                </p>
              </div>
              {booking.status === "confirmed" && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setCancelId(booking.id)}
                >
                  Cancelar
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      <ConfirmModal
        open={cancelId !== null}
        title="Cancelar reserva"
        message="¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => { setCancelId(null); setCancelling(false); }}
      />
    </div>
  );
};

export default Dashboard;
