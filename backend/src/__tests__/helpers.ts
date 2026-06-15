import request from "supertest";
import app from "../app";
import prisma from "../config/db";

export const cleanDb = async () => {
  await prisma.favorite.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.field.deleteMany();
  await prisma.user.deleteMany();
};

export const registerUser = async (overrides: Record<string, any> = {}) => {
  return request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: "test@test.com",
      password: "Test1234!",
      ...overrides,
    });
};

export const loginUser = async (email = "test@test.com", password = "Test1234!") => {
  return request(app).post("/api/auth/login").send({ email, password });
};

export const getAuthToken = async () => {
  const res = await registerUser();
  return res.body.accessToken as string;
};

export const getAdminToken = async () => {
  const email = `admin_${Date.now()}@test.com`;
  const hashedPassword = await (await import("bcryptjs")).hash("Test1234!", 10);
  const user = await prisma.user.create({
    data: { name: "Admin", email, password: hashedPassword, role: "admin" },
  });
  const res = await loginUser(email, "Test1234!");
  return res.body.accessToken as string;
};

export const createTestField = async (token: string, overrides: Record<string, any> = {}) => {
  return request(app)
    .post("/api/fields")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Campo Test",
      description: "Un campo de prueba",
      location: "Málaga",
      sport: "Fútbol",
      priceHour: 25,
      ...overrides,
    });
};
