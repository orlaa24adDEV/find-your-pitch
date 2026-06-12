import { Request, Response, NextFunction } from "express";
import { getAllFields, getFieldById, createField, searchFields, updateField, deleteField, updateFieldImage } from "../services/fields.service";

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

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await updateField(Number(req.params.id), req.body);
    res.json(field);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteField(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se seleccionó ninguna imagen" });
    }
    const imageUrl = `/images/fields/${req.file.filename}`;
    const field = await updateFieldImage(Number(req.params.id), imageUrl);
    res.json(field);
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
