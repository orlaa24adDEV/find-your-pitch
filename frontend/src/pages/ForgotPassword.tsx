import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { forgotPassword as forgotPasswordService } from "../services/auth.service";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast("Introduce tu email", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPasswordService(email.trim());
      setResetUrl(data.resetUrl || null);
      setSent(true);
    } catch {
      addToast("Error al enviar el correo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold text-ink text-center mb-6">
          Recuperar contraseña
        </h1>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-ink-600">
              Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            {resetUrl && (
              <div className="bg-slate-100 p-3 rounded-lg">
                <p className="text-xs text-ink-600 mb-1">🔧 Modo desarrollo — enlace directo:</p>
                <a
                  href={resetUrl}
                  className="text-electric hover:underline text-sm break-all"
                >
                  {resetUrl}
                </a>
              </div>
            )}
            <p className="text-sm text-ink-600">
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <Link
              to="/login"
              className="inline-block text-electric hover:underline text-sm"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-ink-600">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <Input
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Enviar enlace
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
