import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerService } from "../services/auth.service";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Card from "../components/ui/Card";

interface FormErrors {
  name?: string;
  age?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError("");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    const ageNum = Number(form.age);
    if (!form.age.trim()) {
      newErrors.age = "La edad es obligatoria";
    } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      newErrors.age = "Edad inválida (1-120)";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Debe tener al menos una mayúscula";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Debe tener al menos un número";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
      newErrors.password = "Debe tener al menos un carácter especial";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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
      const data = await registerService(
        form.name.trim(),
        form.email.trim(),
        form.password,
        Number(form.age)
      );
      login(data.user, data.accessToken);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Error al registrarse";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold text-ink text-center mb-6">
          Crear cuenta
        </h1>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label="Edad"
            type="number"
            placeholder="Tu edad"
            min={1}
            max={120}
            value={form.age}
            onChange={(e) => updateField("age", e.target.value)}
            error={errors.age}
          />
          <Input
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
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
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-ink-600 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-electric hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
