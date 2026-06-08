import { Request, Response, NextFunction } from "express";
import { getAllFields, getFieldById, createField, searchFields } from "../services/fields.service";

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const fields = await getAllFields();
    res.json(fields);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await getFieldById(Number(req.params.id));
    res.json(field);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await createField(req.body);
    res.status(201).json(field);
  } catch (error) {
    next(error);
  }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) || "";
    const fields = await searchFields(query);
    res.json(fields);
  } catch (error) {
    next(error);
  }
};
