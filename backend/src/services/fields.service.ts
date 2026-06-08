import prisma from "../config/db";

export const getAllFields = async () => {
  return prisma.field.findMany({ orderBy: { createdAt: "desc" } });
};

export const getFieldById = async (id: number) => {
  const field = await prisma.field.findUnique({
    where: { id },
    include: { bookings: true },
  });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }
  return field;
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

export const searchFields = async (query: string) => {
  return prisma.field.findMany({
    where: {
      OR: [
        { sport: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
};
