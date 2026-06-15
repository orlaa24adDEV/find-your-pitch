import { Request, Response, NextFunction } from "express";
import * as favoritesService from "../services/favorites.service";
import { getPaginationParams } from "../utils/pagination";

export const toggle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const fieldId = parseInt(req.params.fieldId, 10);
    const result = await favoritesService.toggleFavorite(userId, fieldId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const params = getPaginationParams(req.query.page as string, req.query.limit as string);
    const result = await favoritesService.getUserFavorites(userId, params);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
