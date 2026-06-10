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

  const userOverlap = await prisma.booking.findMany({
    where: {
      userId,
      date: new Date(data.date),
      status: { in: ["unpaid", "confirmed"] },
    },
  });
  for (const b of userOverlap) {
    if (data.startTime < b.endTime && data.endTime > b.startTime) {
      throw Object.assign(
        new Error("Ya tienes una reserva en este horario"),
        { statusCode: 409 }
      );
    }
  }

  return prisma.booking.create({
    data: {
      userId,
      fieldId: data.fieldId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      status: "unpaid",
    },
    include: { field: true },
  });
};

export const getUserBookings = async (userId: number) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  await prisma.booking.deleteMany({
    where: {
      userId,
      status: "cancelled",
      updatedAt: { lt: fiveMinutesAgo },
    },
  });

  return prisma.booking.findMany({
    where: { userId, status: { not: "unpaid" } },
    include: { field: true },
    orderBy: { date: "desc" },
  });
};

export const getUnpaidBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId, status: "unpaid" },
    include: { field: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getBookingById = async (id: number, userId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { field: true },
  });
  if (!booking) {
    throw Object.assign(new Error("Reserva no encontrada"), { statusCode: 404 });
  }
  if (booking.userId !== userId) {
    throw Object.assign(new Error("No autorizado"), { statusCode: 403 });
  }
  return booking;
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
    data: { status: "cancelled" },
  });
};

export const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: { field: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" },
  });
};

export const payBooking = async (id: number, userId: number) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw Object.assign(new Error("Reserva no encontrada"), { statusCode: 404 });
  }
  if (booking.userId !== userId) {
    throw Object.assign(new Error("No autorizado"), { statusCode: 403 });
  }
  if (booking.status !== "unpaid") {
    throw Object.assign(new Error("La reserva ya está pagada o cancelada"), { statusCode: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return prisma.booking.update({
    where: { id },
    data: { status: "confirmed" },
    include: { field: true },
  });
};
