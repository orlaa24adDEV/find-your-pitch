import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginService } from "../services/auth.service";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Card from "../components/ui/Card";

interface FormErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const data = await loginService(email.trim(), password);
      login(data.user, data.accessToken);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Error al iniciar sesión";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold text-ink text-center mb-6">
          Iniciar sesión
        </h1>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
              setServerError("");
            }}
            error={errors.email}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
              setServerError("");
            }}
            error={errors.password}
          />
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-ink-600 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-electric hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
