import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, age } = req.body;
    const result = await registerUser(name, email, password, age);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
