import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { registerUser, loginUser, refreshTokens, getUserById, updateUser, changeUserPassword, updateAvatarUrl, forgotPassword, resetPassword } from "../services/auth.service";
import { compressAvatar } from "../utils/compressImage";

const REFRESH_COOKIE = "refreshToken";

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, age } = req.body;
    const user = await updateUser(req.user!.id, { name, email, age });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changeUserPassword(req.user!.id, currentPassword, newPassword);
    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se seleccionó ninguna imagen" });
    }
    const newFilename = await compressAvatar(req.file.path);
    const avatarUrl = `/images/avatars/${newFilename}`;
    const user = await updateAvatarUrl(req.user!.id, avatarUrl);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const promoteToAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role: "admin" },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, age } = req.body;
    const result = await registerUser(name, email, password, age);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const result = await refreshTokens(refreshToken);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const resetUrl = await forgotPassword(email);
    const response: any = { message: "Si el email está registrado, recibirás un enlace para restablecer tu contraseña" };
    if (resetUrl) {
      response.resetUrl = resetUrl;
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    await resetPassword(token, password);
    res.json({ message: "Contraseña restablecida correctamente" });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  res.json({ message: "Sesión cerrada" });
};
