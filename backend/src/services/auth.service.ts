import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";

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
    throw Object.assign(new Error("Email already in use"), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, age },
  });

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age },
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
    user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age },
  };
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age },
    };
  } catch {
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }
};
