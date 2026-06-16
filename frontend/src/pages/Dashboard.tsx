import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBookings } from "../hooks/useBookings";
import { useFavorites } from "../hooks/useFavorites";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

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
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const { bookings, loading, error, cancel, page, totalPages, goToPage } = useBookings();
  const { favFields, loadingFavs, favPage, favTotalPages, toggle, fetchFavFields, goToFavPage } = useFavorites();
  const navigate = useNavigate();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [tab, setTab] = useState<"bookings" | "favorites">("bookings");

  useEffect(() => {
    if (tab === "favorites") {
      fetchFavFields(favPage);
    }
  }, [tab, favPage, fetchFavFields]);

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    await cancel(cancelId);
    addToast("Reserva cancelada", "success");
    setCancelling(false);
    setCancelId(null);
  };

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const tabs = [
    { key: "bookings" as const, label: "Reservas" },
    { key: "favorites" as const, label: "Favoritos" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-ink mb-6">
        {user?.name ? `Hola, ${user.name}` : "Mi panel"}
      </h1>

      <div className="flex gap-1 mb-6 border-b border-ink-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "text-pitch border-pitch"
                : "text-ink-500 border-transparent hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <>
          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-5 bg-ink-100 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-ink-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-ink-100 rounded w-1/4" />
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-600 text-lg mb-4">No tienes reservas</p>
              <Button variant="primary" onClick={() => navigate("/")}>
                Explorar campos
              </Button>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
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

          {bookings.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          )}
        </>
      )}

      {tab === "favorites" && (
        <>
          {loadingFavs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-ink-100 rounded-lg mb-4" />
                  <div className="h-5 bg-ink-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-ink-100 rounded w-1/2" />
                </Card>
              ))}
            </div>
          )}

          {!loadingFavs && favFields.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-600 text-lg mb-4">No tienes campos favoritos</p>
              <Button variant="primary" onClick={() => navigate("/")}>
                Explorar campos
              </Button>
            </div>
          )}

          {!loadingFavs && favFields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favFields.map((field) => (
                <Card
                  key={field.id}
                  className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/fields/${field.id}`)}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-pitch-100 to-pitch-200">
                    {field.imageUrl ? (
                      <img
                        src={`${API_URL}${field.imageUrl}`}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink truncate">{field.name}</h3>
                    <p className="text-sm text-ink-600 truncate">
                      {field.sport} &middot; {field.location}
                    </p>
                    <p className="text-pitch font-bold mt-1">
                      {field.priceHour.toFixed(2)}€ / hora
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggle(field.id); }}
                    className="p-2 rounded-full hover:bg-ink-100 transition-colors flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5 text-red-500 fill-red-500"
                      fill="currentColor"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </Card>
              ))}
            </div>
          )}

          {favFields.length > 0 && (
            <Pagination page={favPage} totalPages={favTotalPages} onPageChange={goToFavPage} />
          )}
        </>
      )}

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
