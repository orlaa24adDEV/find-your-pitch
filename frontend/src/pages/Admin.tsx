import { useState, useEffect, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Field } from "../interfaces/Field";
import { Booking } from "../interfaces/Booking";
import { getFields } from "../services/fields.service";
import { getAllBookings, createField, updateField, deleteField, uploadFieldImage } from "../services/admin.service";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

type Tab = "fields" | "bookings";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

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
    case "unpaid":
      return (
        <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
          Pendiente de pago
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

const Admin = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("fields");
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsPage, setFieldsPage] = useState(1);
  const [fieldsTotalPages, setFieldsTotalPages] = useState(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formOpen) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [formOpen]);

  const emptyForm = {
    name: "",
    description: "",
    location: "",
    sport: "",
    priceHour: 0,
    imageUrl: "",
    lat: 0,
    lng: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchFields = async (p = 1) => {
    try {
      const result = await getFields(p, 20);
      setFields(result.data);
      setFieldsPage(result.page);
      setFieldsTotalPages(result.totalPages);
    } catch {
      setError("Error al cargar campos");
    }
  };

  const fetchBookings = async (p = 1) => {
    try {
      const result = await getAllBookings(p, 20);
      setBookings(result.data);
      setBookingsPage(result.page);
      setBookingsTotalPages(result.totalPages);
    } catch {
      setError("Error al cargar reservas");
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "fields") {
        await fetchFields();
      } else {
        await fetchBookings();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingField(null);
    setFormOpen(true);
  };

  const openEdit = (field: Field) => {
    setForm({
      name: field.name,
      description: field.description,
      location: field.location,
      sport: field.sport,
      priceHour: field.priceHour,
      imageUrl: field.imageUrl || "",
      lat: field.lat || 0,
      lng: field.lng || 0,
    });
    setEditingField(field);
    setFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingField) {
        await updateField(editingField.id, form);
        addToast("Campo actualizado", "success");
      } else {
        await createField({
          ...form,
          priceHour: Number(form.priceHour),
          lat: form.lat ? Number(form.lat) : undefined,
          lng: form.lng ? Number(form.lng) : undefined,
          imageUrl: form.imageUrl || undefined,
        });
        addToast("Campo creado", "success");
      }
      setFormOpen(false);
      setEditingField(null);
      await fetchFields(fieldsPage);
    } catch {
      addToast("Error al guardar el campo", "error");
    }
  };

  const handleFieldImageUpload = async (id: number, file: File) => {
    setImageUploading(true);
    try {
      const updated = await uploadFieldImage(id, file);
      setFields((prev) => prev.map((f) => (f.id === id ? updated : f)));
      if (editingField?.id === id) {
        setForm((prev) => ({ ...prev, imageUrl: updated.imageUrl || "" }));
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { message: string } } }).response.data.message)
          : "Error al subir la imagen";
      setError(msg);
    } finally {
      setImageUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este campo? Se borrarán todas sus reservas.")) return;
    try {
      await deleteField(id);
      addToast("Campo eliminado", "success");
      await fetchFields(fieldsPage);
    } catch {
      addToast("Error al eliminar el campo", "error");
    }
  };

  if (!user || user.role !== "admin") {
    navigate("/dashboard", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">Panel de administración</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="h-5 bg-ink-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-ink-100 rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={loadData}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-ink mb-6">Panel de administración</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-ink-100">
        <button
          onClick={() => setTab("fields")}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === "fields"
              ? "text-pitch border-b-2 border-pitch"
              : "text-ink-600 hover:text-ink"
          }`}
        >
          Campos ({fields.length})
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === "bookings"
              ? "text-pitch border-b-2 border-pitch"
              : "text-ink-600 hover:text-ink"
          }`}
        >
          Reservas ({bookings.length})
        </button>
      </div>

      {tab === "fields" && (
        <>
          <div className="flex justify-end mb-4">
            <Button variant="primary" onClick={openCreate}>
              + Nuevo campo
            </Button>
          </div>

          {/* Create/Edit form */}
          {formOpen && (
            <div ref={formRef}>
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-ink mb-4">
                {editingField ? "Editar campo" : "Nuevo campo"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Deporte</label>
                  <input
                    type="text"
                    value={form.sport}
                    onChange={(e) => setForm({ ...form, sport: e.target.value })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-ink-600 mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Precio por hora (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.priceHour}
                    onChange={(e) => setForm({ ...form, priceHour: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-ink-600 mb-1">Imagen del campo</label>
                  <div className="flex items-center gap-4">
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl.startsWith("http") ? form.imageUrl : `${API_URL}${form.imageUrl}`}
                        alt="Preview"
                        loading="lazy"
                        decoding="async"
                        className="w-24 h-16 rounded-lg object-cover border border-ink-200"
                      />
                    ) : (
                      <div className="w-24 h-16 rounded-lg bg-ink-100 flex items-center justify-center text-xs text-ink-500">
                        Sin imagen
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && editingField) {
                            handleFieldImageUpload(editingField.id, file);
                          }
                          e.target.value = "";
                        }}
                      />
                      {editingField ? (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          loading={imageUploading}
                        >
                          Subir imagen
                        </Button>
                      ) : (
                        <p className="text-xs text-ink-500">Guarda el campo primero para subir imagen</p>
                      )}
                      <input
                        type="text"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="O pega una URL..."
                        className="w-full px-3 py-1.5 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Latitud</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Longitud</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pitch"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    {editingField ? "Guardar cambios" : "Crear campo"}
                  </Button>
                </div>
              </form>
            </Card>
            </div>
          )}

          {/* Fields list */}
          <div className="space-y-3">
            {fields.map((field) => (
              <Card key={field.id} className="flex items-center gap-4">
                {field.imageUrl ? (
                  <img
                      src={field.imageUrl.startsWith("http") ? field.imageUrl : `${API_URL}${field.imageUrl}`}
                      alt={field.name}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 object-cover rounded"
                    />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-ink-100 flex items-center justify-center text-xs text-ink-500 shrink-0">
                    Sin img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-ink truncate">{field.name}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0">
                      {field.sport}
                    </span>
                  </div>
                  <p className="text-sm text-ink-600 truncate">{field.location}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button variant="outline" size="sm" onClick={() => openEdit(field)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(field.id)}>
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
            {fields.length === 0 && (
              <p className="text-center text-ink-600 py-8">No hay campos todavía</p>
            )}
            <Pagination page={fieldsPage} totalPages={fieldsTotalPages} onPageChange={(p) => { fetchFields(p); }} />
          </div>
        </>
      )}

      {tab === "bookings" && (
        <div className="space-y-3">
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
                <p className="text-xs text-ink-500 mt-1">
                  Usuario: {booking.user?.name || `#${booking.userId}`} ({booking.user?.email || ""})
                </p>
              </div>
            </Card>
          ))}
          {bookings.length === 0 && (
            <p className="text-center text-ink-600 py-8">No hay reservas</p>
          )}
          <Pagination page={bookingsPage} totalPages={bookingsTotalPages} onPageChange={(p) => { fetchBookings(p); }} />
        </div>
      )}
    </div>
  );
};

export default Admin;
