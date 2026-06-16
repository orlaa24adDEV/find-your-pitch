import { Request, Response, NextFunction } from "express";
import { getAllFields, getFieldById, createField, searchFields, updateField, deleteField, updateFieldImage, getFieldAvailability, getDistinctSports } from "../services/fields.service";
import { getPaginationParams } from "../utils/pagination";

const parseFilters = (query: any) => ({
  sport: query.sport as string | undefined,
  minPrice: query.minPrice ? Number(query.minPrice) : undefined,
  maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
});

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const filters = parseFilters(req.query);
    const result = await getAllFields(params, req.user?.id, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const field = await getFieldById(Number(req.params.id), req.user?.id);
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
    const imageUrl = `/data/images/fields/${req.file.filename}`;
    const field = await updateFieldImage(Number(req.params.id), imageUrl);
    res.json(field);
  } catch (error) {
    next(error);
  }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) || "";
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const filters = parseFilters(req.query);
    const result = await searchFields(query, params, req.user?.id, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const result = await getFieldAvailability(Number(req.params.id), date);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sports = await getDistinctSports();
    res.json(sports);
  } catch (error) {
    next(error);
  }
};
