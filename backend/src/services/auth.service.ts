import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";

export const registerUser = async (name: string, email: string, password: string, age?: number) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error("Email already in use"), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, age },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age } };
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

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age } };
};
