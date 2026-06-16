import { Response, NextFunction } from "express";
import { Request } from "express";
import {
  getAllUsers,
  getUserById,
  getUserBookings,
  deleteUser,
  updateUserRole,
} from "../services/users.service";
import { getPaginationParams } from "../utils/pagination";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const search = req.query.search as string | undefined;
    const result = await getAllUsers(params, search);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(Number(req.params.id));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const listUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const bookings = await getUserBookings(Number(req.params.id), params);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await deleteUser(Number(req.params.id));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await updateUserRole(Number(req.params.id), req.body.role);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
