import { useState, FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { resetPassword as resetPasswordService } from "../services/auth.service";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import Card from "../components/ui/Card";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Debe tener al menos una mayúscula";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Debe tener al menos un número";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      newErrors.password = "Debe tener al menos un carácter especial";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token) {
      addToast("Token inválido", "error");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordService(token, password);
      addToast("Contraseña restablecida correctamente", "success");
      navigate("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Error al restablecer la contraseña";
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <h1 className="text-2xl font-bold text-ink text-center mb-6">
            Enlace inválido
          </h1>
          <p className="text-center text-ink-600 mb-6">
            Este enlace no es válido o ha expirado. Solicita uno nuevo.
          </p>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-electric hover:underline"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold text-ink text-center mb-6">
          Nueva contraseña
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Nueva contraseña"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
          />
          <ul className="text-xs text-ink-600 space-y-0.5 -mt-2">
            <li>• Mínimo 8 caracteres</li>
            <li>• Al menos una mayúscula</li>
            <li>• Al menos un número</li>
            <li>• Al menos un carácter especial</li>
          </ul>
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
          />
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Restablecer contraseña
          </Button>
        </form>

        <p className="text-center text-sm text-ink-600 mt-6">
          <Link to="/login" className="text-electric hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default ResetPassword;
