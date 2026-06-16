import { useState, useEffect, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../services/auth.service";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AvatarCropModal from "../components/AvatarCropModal";
import api from "../services/api";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [cropImage, setCropImage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setName(data.name);
        setEmail(data.email);
        setAge(data.age ?? "");
        setAvatarUrl(data.avatarUrl ?? null);
      } catch {
        setError("Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedSave = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarSaving(true);
    setError("");
    setCropImage(null);
    try {
      const response = await api.post("/auth/me/avatar", formData);
      const newAvatarUrl = response.data.avatarUrl;
      setAvatarUrl(newAvatarUrl);
      updateUser(response.data);
      setSuccess("Foto de perfil actualizada");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { message: string } } }).response.data.message)
          : "Error al subir la imagen";
      setError(msg);
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await updateProfile({
        name,
        email,
        age: age === "" ? undefined : Number(age),
      });
      setName(data.name);
      setEmail(data.email);
      setAge(data.age ?? "");
      updateUser(data);
      setSuccess("Perfil actualizado");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { message: string } } }).response.data.message)
          : "Error al actualizar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (newPassword.length < 8) {
      setPassError("Mínimo 8 caracteres");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPassError("Debe tener al menos una mayúscula");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPassError("Debe tener al menos un número");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setPassError("Debe tener al menos un carácter especial");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Las contraseñas no coinciden");
      return;
    }

    setPassSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { message: string } } }).response.data.message)
          : "Error al cambiar contraseña";
      setPassError(msg);
    } finally {
      setPassSaving(false);
    }
  };

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">Mi perfil</h1>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-ink-100 rounded w-1/3" />
            <div className="h-10 bg-ink-100 rounded w-full" />
            <div className="h-5 bg-ink-100 rounded w-1/3" />
            <div className="h-10 bg-ink-100 rounded w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-ink mb-6">Mi perfil</h1>

      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Avatar */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={`${API_URL}${avatarUrl}`}
                alt="Avatar"
                loading="lazy"
                decoding="async"
                className="w-20 h-20 rounded-full object-cover border-2 border-ink-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-pitch text-white flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {avatarSaving && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Subir foto
            </Button>
            <p className="text-xs text-ink-500">JPG, PNG o WebP. Máx 2 MB.</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Información personal</h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink mb-4">Cambiar contraseña</h2>
        {passError && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            {passError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" loading={passSaving}>
              Cambiar contraseña
            </Button>
          </div>
        </form>
      </Card>

      {cropImage && (
        <AvatarCropModal
          imageUrl={cropImage}
          onSave={handleCroppedSave}
          onClose={() => setCropImage(null)}
        />
      )}
    </div>
  );
};

export default Profile;
