import prisma from "../config/db";
import { PaginationParams, PaginatedResult, paginatedResult } from "../utils/pagination";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  age: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllUsers = async (
  params: PaginationParams,
  search?: string
): Promise<PaginatedResult<any>> => {
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.user.count({ where }),
  ]);
  return paginatedResult(data, total, params);
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, bookings: { include: { field: true }, orderBy: { date: "desc" } } },
  });
  if (!user) {
    throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
  }
  return user;
};

export const getUserBookings = async (
  userId: number,
  params: PaginationParams
): Promise<PaginatedResult<any>> => {
  const where = { userId };
  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { field: true },
      orderBy: { date: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.booking.count({ where }),
  ]);
  return paginatedResult(data, total, params);
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
  }
  await prisma.booking.deleteMany({ where: { userId: id } });
  await prisma.favorite.deleteMany({ where: { userId: id } });
  await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });
  return prisma.user.delete({ where: { id }, select: userSelect });
};

export const updateUserRole = async (id: number, role: string) => {
  if (!["user", "admin"].includes(role)) {
    throw Object.assign(new Error("Rol inválido"), { statusCode: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw Object.assign(new Error("Usuario no encontrado"), { statusCode: 404 });
  }
  return prisma.user.update({
    where: { id },
    data: { role },
    select: userSelect,
  });
};
