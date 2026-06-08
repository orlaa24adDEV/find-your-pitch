import prisma from "../config/db";

export const createBooking = async (userId: number, data: {
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
}) => {
  const field = await prisma.field.findUnique({ where: { id: data.fieldId } });
  if (!field) {
    throw Object.assign(new Error("Pista no encontrada"), { statusCode: 404 });
  }

  const existing = await prisma.booking.findUnique({
    where: {
      fieldId_date_startTime: {
        fieldId: data.fieldId,
        date: new Date(data.date),
        startTime: data.startTime,
      },
    },
  });
  if (existing) {
    throw Object.assign(new Error("Horario ya reservado"), { statusCode: 409 });
  }

  return prisma.booking.create({
    data: {
      userId,
      fieldId: data.fieldId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
    },
    include: { field: true },
  });
};

export const getUserBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: { field: true },
    orderBy: { date: "desc" },
  });
};

export const getFieldBookings = async (fieldId: number) => {
  return prisma.booking.findMany({
    where: { fieldId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" },
  });
};

export const cancelBooking = async (id: number, userId: number) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw Object.assign(new Error("Reserva no encontrada"), { statusCode: 404 });
  }
  if (booking.userId !== userId) {
    throw Object.assign(new Error("No autorizado"), { statusCode: 403 });
  }

  return prisma.booking.update({
    where: { id },
    data: { status: "cancelado" },
  });
};
