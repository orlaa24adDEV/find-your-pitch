import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFieldById } from "../services/fields.service";
import { createBooking } from "../services/booking.service";
import { Field } from "../interfaces/Field";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

const FieldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchField = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getFieldById(Number(id));
        setField(data);
      } catch {
        setError("Error al cargar el campo");
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [id]);

  const handleBooking = async () => {
    if (!date || !startTime || !endTime) return;

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess(false);

    try {
      await createBooking({
        fieldId: Number(id),
        date,
        startTime,
        endTime,
      });
      setBookingSuccess(true);
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Error al reservar";
      setBookingError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-ink-100 rounded-xl" />
          <div className="h-8 bg-ink-100 rounded w-1/2" />
          <div className="h-4 bg-ink-100 rounded w-1/3" />
          <div className="h-4 bg-ink-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error || "Campo no encontrado"}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-64 bg-gradient-to-br from-pitch-100 to-pitch-200 rounded-xl flex items-center justify-center mb-8">
        <svg className="w-20 h-20 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">{field.name}</h1>
          <p className="text-ink-600 mb-4">
            {field.sport} &middot; {field.location}
          </p>
          <p className="text-ink-600 mb-6">{field.description}</p>
          <p className="text-pitch font-bold text-2xl mb-6">
            {field.priceHour.toFixed(2)}€ / hora
          </p>
        </div>

        <div>
          <Card>
            <h2 className="text-xl font-semibold text-ink mb-4">
              Reservar
            </h2>

            {bookingSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                ¡Reserva confirmada!
              </div>
            )}

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {bookingError}
              </div>
            )}

            {isAuthenticated ? (
              <div className="space-y-4">
                <Input
                  label="Fecha"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Hora inicio"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <Input
                    label="Hora fin"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  loading={bookingLoading}
                  disabled={!date || !startTime || !endTime}
                  onClick={handleBooking}
                >
                  Reservar ahora
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-ink-600 mb-4">
                  Inicia sesión para reservar
                </p>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FieldDetail;
