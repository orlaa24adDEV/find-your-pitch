export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPaginationParams = (page?: string, limit?: string): PaginationParams => {
  const p = Math.max(1, parseInt(page || "1", 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit || "12", 10) || 12));
  return { page: p, limit: l };
};

export const paginatedResult = <T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> => ({
  data,
  total,
  page: params.page,
  limit: params.limit,
  totalPages: Math.ceil(total / params.limit),
});
