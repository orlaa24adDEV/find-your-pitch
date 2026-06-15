import prisma from "../config/db";
import { PaginationParams, PaginatedResult, paginatedResult } from "../utils/pagination";

const addFavorited = (fields: any[], favoriteIds: number[]) =>
  fields.map((f) => ({ ...f, favorited: favoriteIds.includes(f.id) }));

export const getAllFields = async (params: PaginationParams, userId?: number): Promise<PaginatedResult<any>> => {
  const [data, total] = await Promise.all([
    prisma.field.findMany({ orderBy: { createdAt: "desc" }, skip: (params.page - 1) * params.limit, take: params.limit }),
    prisma.field.count(),
  ]);

  let favoriteIds: number[] = [];
  if (userId) {
    const favs = await prisma.favorite.findMany({ where: { userId }, select: { fieldId: true } });
    favoriteIds = favs.map((f) => f.fieldId);
  }

  return paginatedResult(addFavorited(data, favoriteIds), total, params);
};

export const getFieldById = async (id: number, userId?: number) => {
  const field = await prisma.field.findUnique({
    where: { id },
    include: { bookings: true },
  });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }

  let favorited = false;
  if (userId) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_fieldId: { userId, fieldId: id } },
    });
    favorited = !!fav;
  }

  return { ...field, favorited };
};

export const createField = async (data: {
  name: string;
  description: string;
  location: string;
  sport: string;
  priceHour: number;
  imageUrl?: string;
}) => {
  return prisma.field.create({ data });
};

export const searchFields = async (query: string, params: PaginationParams, userId?: number): Promise<PaginatedResult<any>> => {
  const where = {
    OR: [
      { sport: { contains: query, mode: "insensitive" as const } },
      { location: { contains: query, mode: "insensitive" as const } },
      { name: { contains: query, mode: "insensitive" as const } },
    ],
  };
  const [data, total] = await Promise.all([
    prisma.field.findMany({ where, orderBy: { createdAt: "desc" }, skip: (params.page - 1) * params.limit, take: params.limit }),
    prisma.field.count({ where }),
  ]);

  let favoriteIds: number[] = [];
  if (userId) {
    const favs = await prisma.favorite.findMany({ where: { userId }, select: { fieldId: true } });
    favoriteIds = favs.map((f) => f.fieldId);
  }

  return paginatedResult(addFavorited(data, favoriteIds), total, params);
};

export const updateField = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    location?: string;
    sport?: string;
    priceHour?: number;
    imageUrl?: string;
    lat?: number;
    lng?: number;
  }
) => {
  const field = await prisma.field.findUnique({ where: { id } });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }
  return prisma.field.update({ where: { id }, data });
};

export const updateFieldImage = async (id: number, imageUrl: string) => {
  const field = await prisma.field.findUnique({ where: { id } });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }
  return prisma.field.update({ where: { id }, data: { imageUrl } });
};

export const deleteField = async (id: number) => {
  const field = await prisma.field.findUnique({ where: { id } });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }
  await prisma.booking.deleteMany({ where: { fieldId: id } });
  return prisma.field.delete({ where: { id } });
};
