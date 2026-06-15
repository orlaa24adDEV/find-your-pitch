import prisma from "../config/db";
import { PaginationParams, PaginatedResult, paginatedResult } from "../utils/pagination";

export const toggleFavorite = async (userId: number, fieldId: number) => {
  const field = await prisma.field.findUnique({ where: { id: fieldId } });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_fieldId: { userId, fieldId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId, fieldId } });
  return { favorited: true };
};

export const getUserFavorites = async (
  userId: number,
  params: PaginationParams
): Promise<PaginatedResult<{ id: number; name: string; sport: string; location: string; priceHour: number; imageUrl: string | null }>> => {
  const where = { userId };
  const [data, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        field: {
          select: { id: true, name: true, sport: true, location: true, priceHour: true, imageUrl: true },
        },
      },
    }),
    prisma.favorite.count({ where }),
  ]);

  return paginatedResult(
    data.map((f) => f.field),
    total,
    params
  );
};

export const getFavoriteIds = async (userId: number): Promise<number[]> => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { fieldId: true },
  });
  return favorites.map((f) => f.fieldId);
};
