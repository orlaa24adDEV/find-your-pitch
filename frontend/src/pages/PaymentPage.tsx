import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBookingById, payBooking } from "../services/booking.service";
import { Booking } from "../interfaces/Booking";
import Button from "../components/ui/Button";

type PaymentMethod = "card" | "paypal" | "applepay";

const calcHours = (start: string, end: string) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff / 60 : 0;
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

const PaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholder, setCardholder] = useState("");

  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchBooking = async () => {
      try {
        const data = await getBookingById(Number(bookingId));
        if (data.status !== "unpaid") {
          setError("Esta reserva ya fue pagada o cancelada");
          return;
        }
        setBooking(data);
      } catch {
        setError("Reserva no encontrada");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, isAuthenticated, navigate]);

  const handlePay = async () => {
    setPaying(true);
    setPayError("");

    try {
      await payBooking(Number(bookingId));
      setPaid(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err: any) {
      setPayError(err?.response?.data?.message || "Error al procesar el pago");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pitch border-t-transparent" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-600 text-lg mb-4">{error || "Reserva no encontrada"}</p>
        <Button variant="primary" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">¡Pago exitoso!</h2>
        <p className="text-ink-600 mb-6">Tu reserva ha sido confirmada</p>
        <p className="text-sm text-ink-600 animate-pulse">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  const field = booking.field!;
  const hours = calcHours(booking.startTime, booking.endTime);
  const totalPrice = hours * field.priceHour;
  const priceText = `${totalPrice.toFixed(2)}€`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-8">Finalizar pago</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
            <div className="h-36 bg-gradient-to-br from-pitch-100 to-pitch-200 flex items-center justify-center">
              {field.imageUrl ? (
                <img
                  src={`http://localhost:3000${field.imageUrl}`}
                  alt={field.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <svg className="w-10 h-10 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h2 className="font-semibold text-ink">{field.name}</h2>
              <p className="text-sm text-ink-600">{field.location}</p>
              <div className="text-sm text-ink-600">
                {new Date(booking.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-sm text-ink-600">
                {booking.startTime} - {booking.endTime}
              </div>
              <div className="pt-2 border-t border-ink-100 space-y-1">
                <div className="flex items-center justify-between text-sm text-ink-600">
                  <span>{hours.toFixed(1)}h × {field.priceHour.toFixed(2)}€</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">Total</span>
                  <span className="text-xl font-bold text-pitch">{priceText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-xl border border-ink-100 p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">
              Método de pago
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setMethod("card")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  method === "card"
                    ? "border-pitch bg-pitch-50"
                    : "border-ink-100 hover:border-ink-200"
                }`}
              >
                <svg className="w-8 h-8 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span className="text-xs font-medium text-ink">Tarjeta</span>
              </button>

              <button
                onClick={() => setMethod("paypal")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  method === "paypal"
                    ? "border-pitch bg-pitch-50"
                    : "border-ink-100 hover:border-ink-200"
                }`}
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                </svg>
                <span className="text-xs font-medium text-ink">PayPal</span>
              </button>

              <button
                onClick={() => setMethod("applepay")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  method === "applepay"
                    ? "border-pitch bg-pitch-50"
                    : "border-ink-100 hover:border-ink-200"
                }`}
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.569 12.625c-.023-2.958 1.996-4.387 2.085-4.457-1.139-1.635-2.879-1.858-3.491-1.877-1.453-.15-2.88.878-3.628.878-.77 0-1.918-.861-3.163-.836-1.621.025-3.133.954-3.969 2.409-1.71 2.947-.438 7.309 1.221 9.701.814 1.172 1.777 2.488 3.058 2.439 1.225-.049 1.688-.792 3.167-.792s1.904.792 3.19.766c1.322-.024 2.157-1.192 2.947-2.375.419-.644.736-1.293.916-1.763-1.806-.461-3.163-1.608-3.352-3.258zm-2.889-6.083c.623-.773 1.045-1.829.93-2.904-.902.038-1.997.606-2.645 1.365-.58.672-1.089 1.751-.952 2.781.959.074 2.044-.514 2.667-1.242z"/>
                </svg>
                <span className="text-xs font-medium text-ink">Apple Pay</span>
              </button>
            </div>

            {method === "card" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Número de tarjeta</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-ink focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent transition-all font-mono text-lg tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Fecha de caducidad</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-ink-200 text-ink focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">CVC</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className="w-full px-4 py-3 rounded-xl border border-ink-200 text-ink focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Titular de la tarjeta</label>
                  <input
                    type="text"
                    placeholder="Nombre del titular"
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-ink focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent transition-all"
                  />
                </div>

                {payError && (
                  <p className="text-sm text-red-500">{payError}</p>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  loading={paying}
                  disabled={!cardNumber.trim() || !expiry.trim() || !cvc.trim() || !cardholder.trim()}
                  onClick={handlePay}
                >
                  Pagar {priceText}
                </Button>
              </div>
            )}

            {method === "paypal" && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                </svg>
                <p className="text-ink-600 mb-6">
                  Serás redirigido a PayPal para completar el pago de {priceText}
                </p>
                {payError && <p className="text-sm text-red-500 mb-4">{payError}</p>}
                <Button
                  variant="primary"
                  className="w-full bg-[#003087] hover:bg-[#002267]"
                  size="lg"
                  loading={paying}
                  onClick={handlePay}
                >
                  Pagar con PayPal
                </Button>
              </div>
            )}

            {method === "applepay" && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-ink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.569 12.625c-.023-2.958 1.996-4.387 2.085-4.457-1.139-1.635-2.879-1.858-3.491-1.877-1.453-.15-2.88.878-3.628.878-.77 0-1.918-.861-3.163-.836-1.621.025-3.133.954-3.969 2.409-1.71 2.947-.438 7.309 1.221 9.701.814 1.172 1.777 2.488 3.058 2.439 1.225-.049 1.688-.792 3.167-.792s1.904.792 3.19.766c1.322-.024 2.157-1.192 2.947-2.375.419-.644.736-1.293.916-1.763-1.806-.461-3.163-1.608-3.352-3.258zm-2.889-6.083c.623-.773 1.045-1.829.93-2.904-.902.038-1.997.606-2.645 1.365-.58.672-1.089 1.751-.952 2.781.959.074 2.044-.514 2.667-1.242z"/>
                </svg>
                <p className="text-ink-600 mb-6">
                  Procesando pago de {priceText} con Apple Pay
                </p>
                {payError && <p className="text-sm text-red-500 mb-4">{payError}</p>}
                <Button
                  variant="primary"
                  className="w-full bg-ink hover:bg-ink-600"
                  size="lg"
                  loading={paying}
                  onClick={handlePay}
                >
                  Pagar con Apple Pay
                </Button>
              </div>
            )}

            {!method && (
              <p className="text-center text-ink-600 py-8">
                Selecciona un método de pago para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
