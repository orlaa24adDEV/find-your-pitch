import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener una mayúscula")
  .regex(/[0-9]/, "Debe contener un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener un carácter especial");

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: passwordRule,
  age: z.number().int().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Email inválido").optional(),
  age: z.number().int().min(1).max(120).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: passwordRule,
});

export const createFieldSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  location: z.string().min(1, "La ubicación es requerida"),
  sport: z.string().min(1, "El deporte es requerido"),
  priceHour: z.number().positive("El precio debe ser positivo"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const updateFieldSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  sport: z.string().min(1).optional(),
  priceHour: z.number().positive("El precio debe ser positivo").optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "El token es requerido"),
  password: passwordRule,
});

export const createBookingSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), "Fecha inválida"),
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endTime: z.string().min(1, "La hora de fin es requerida"),
  fieldId: z.number().int().positive(),
});
