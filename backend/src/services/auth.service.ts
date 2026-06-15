import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/db";
import { sendPasswordResetEmail } from "../utils/email";

const generateTokens = (userId: number, email: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const registerUser = async (name: string, email: string, password: string, age?: number) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, age },
  });

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age, avatarUrl: user.avatarUrl },
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error("Credenciales Invalidas"), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw Object.assign(new Error("Credenciales Invalidas"), { statusCode: 401 });
  }

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age, avatarUrl: user.avatarUrl },
  };
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, age: true, avatarUrl: true },
  });
  if (!user) {
    throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
  }
  return user;
};

export const updateUser = async (
  id: number,
  data: { name?: string; email?: string; age?: number }
) => {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      throw Object.assign(new Error("Email ya en uso"), { statusCode: 400 });
    }
  }
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, age: true, avatarUrl: true },
  });
};

export const updateAvatarUrl = async (id: number, avatarUrl: string) => {
  return prisma.user.update({
    where: { id },
    data: { avatarUrl },
    select: { id: true, name: true, email: true, role: true, age: true, avatarUrl: true },
  });
};

export const changeUserPassword = async (
  id: number,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
  }
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw Object.assign(new Error("Contraseña actual incorrecta"), { statusCode: 400 });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, age: true, avatarUrl: true },
  });
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }

  return process.env.NODE_ENV === "production" ? null : resetUrl;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    throw Object.assign(new Error("Token inválido o expirado"), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });
};

export const refreshTokens = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: number;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 401 });
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age, avatarUrl: user.avatarUrl },
    };
  } catch {
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }
};
