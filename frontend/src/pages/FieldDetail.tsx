import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFieldById } from "../services/fields.service";
import { toggleFavorite } from "../services/favorites.service";
import { createBooking, getFieldAvailability, BookedSlot } from "../services/booking.service";
import { Field } from "../interfaces/Field";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DatePicker from "../components/ui/DatePicker";
import TimePicker from "../components/ui/TimePicker";
import MapPreview from "../components/MapPreview";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const calcHours = (start: string, end: string) => {
  if (!start || !end) return 0;
  const diff = timeToMinutes(end) - timeToMinutes(start);
  return diff > 0 ? diff / 60 : 0;
};

const FieldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorited, setFavorited] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("01:00");
  const hours = calcHours(startTime, endTime);
  const totalPrice = field ? hours * field.priceHour : 0;

  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const disabledRanges = useMemo(() =>
    bookedSlots.map((s) => ({ start: s.startTime, end: s.endTime })),
  [bookedSlots]);

  const timeError = useMemo(() => {
    if (!date || !startTime || !endTime) return "";
    if (endTime && timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      return "La hora de fin debe ser posterior a la de inicio";
    }
    if (date === today && timeToMinutes(startTime) <= timeToMinutes(new Date().toTimeString().slice(0, 5))) {
      return "La hora de inicio debe ser posterior a la hora actual";
    }
    return "";
  }, [date, startTime, endTime, today]);

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
        setFavorited(data.favorited || false);
      } catch {
        setError("Error al cargar el campo");
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [id]);

  useEffect(() => {
    if (!date || !id) {
      setBookedSlots([]);
      return;
    }
    let cancelled = false;
    setAvailabilityLoading(true);
    getFieldAvailability(Number(id), date).then((data) => {
      if (!cancelled) setBookedSlots(data.bookedSlots);
    }).catch(() => {
      if (!cancelled) setBookedSlots([]);
    }).finally(() => {
      if (!cancelled) setAvailabilityLoading(false);
    });
    return () => { cancelled = true; };
  }, [date, id]);

  const availableSlotsCount = useMemo(() => {
    if (!bookedSlots.length) return 48;
    const allSlots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        allSlots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return allSlots.filter((slot) => {
      const min = timeToMinutes(slot);
      return !bookedSlots.some((b) => min >= timeToMinutes(b.startTime) && min < timeToMinutes(b.endTime));
    }).length;
  }, [bookedSlots]);

  const handleBooking = async () => {
    if (!date || !startTime || !endTime) return;
    if (timeError) return;

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess(false);

    try {
      const newBooking = await createBooking({
        fieldId: Number(id),
        date,
        startTime,
        endTime,
      });
      setBookingSuccess(true);
      navigate(`/payment/${newBooking.id}`);
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
      <div className="h-64 rounded-xl overflow-hidden mb-8 flex items-center justify-center bg-gradient-to-br from-pitch-100 to-pitch-200">
        {field.imageUrl ? (
          <img
            src={`${API_URL}${field.imageUrl}`}
            alt={field.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.classList.add("flex");
              (e.target as HTMLImageElement).parentElement!.innerHTML = `
                <svg class="w-20 h-20 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/>
                </svg>`;
            }}
          />
        ) : (
          <svg className="w-20 h-20 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/>
          </svg>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-ink">{field.name}</h1>
            {isAuthenticated && (
              <button
                type="button"
                onClick={async () => {
                  const result = await toggleFavorite(field.id);
                  setFavorited(result.favorited);
                }}
                className="p-1.5 rounded-full hover:bg-ink-100 transition-colors"
              >
                <svg
                  className={`w-6 h-6 ${favorited ? "text-red-500 fill-red-500" : "text-ink-300"}`}
                  fill={favorited ? "currentColor" : "none"}
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
            )}
          </div>
          <p className="text-ink-600 mb-4">
            {field.sport} &middot; {field.location}
          </p>
          <p className="text-ink-600 mb-6">{field.description}</p>
          <p className="text-pitch font-bold text-2xl mb-6">
            {field.priceHour.toFixed(2)}€ / hora
          </p>
          {field.lat && field.lng && (
            <div className="mb-6">
              <MapPreview
                lat={field.lat}
                lng={field.lng}
                address={field.location}
                name={field.name}
              />
            </div>
          )}
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
              <div>
                <div className="space-y-4">
                  <DatePicker
                    label="Fecha"
                    value={date}
                    min={today}
                    onChange={setDate}
                  />

                  {date && availabilityLoading && (
                    <p className="text-xs text-ink-500">Cargando disponibilidad...</p>
                  )}

                  {date && !availabilityLoading && bookedSlots.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                      {48 - availableSlotsCount} slot(s) reservado(s) en esta fecha
                      &middot; {availableSlotsCount} disponible(s)
                    </div>
                  )}

                  {date && !availabilityLoading && bookedSlots.length === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                      Todos los horarios disponibles
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TimePicker
                      label="Hora inicio"
                      value={startTime}
                      disabledRanges={disabledRanges}
                      onChange={(val) => {
                        setStartTime(val);
                        if (val) {
                          const [h, m] = val.split(":").map(Number);
                          const end = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                          setEndTime(end);
                        }
                      }}
                    />
                    <TimePicker
                      label="Hora fin"
                      value={endTime}
                      minTime={startTime}
                      disabledRanges={disabledRanges}
                      onChange={setEndTime}
                    />
                  </div>
                  {timeError && (
                    <p className="text-red-500 text-xs mt-1">{timeError}</p>
                  )}
                </div>
                <div className="space-y-4 mt-6 pt-4 border-t border-ink-100">
                  <div className="flex items-center justify-between py-2 px-1">
                    <span className="text-sm text-ink-600">
                      {hours.toFixed(1)}h
                    </span>
                    <span className="text-xl font-bold text-pitch">
                      {totalPrice.toFixed(2)}€
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    loading={bookingLoading}
                    disabled={!date || !startTime || !endTime || !!timeError}
                    onClick={handleBooking}
                  >
                    Reservar ahora
                  </Button>
                </div>
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
