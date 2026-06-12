import { Response, NextFunction } from "express";
import { Request } from "express";
import {
  createBooking,
  getUserBookings,
  getUnpaidBookings,
  getBookingById,
  getFieldBookings,
  cancelBooking,
  payBooking,
  getAllBookings,
} from "../services/bookings.service";
import { getPaginationParams } from "../utils/pagination";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const bookings = await getAllBookings(params);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await createBooking(req.user!.id, req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const bookings = await getUserBookings(req.user!.id, params);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getUnpaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await getUnpaidBookings(req.user!.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await getBookingById(Number(req.params.id), req.user!.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const getByField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await getFieldBookings(Number(req.params.fieldId));
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await cancelBooking(Number(req.params.id), req.user!.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const pay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await payBooking(Number(req.params.id), req.user!.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};
