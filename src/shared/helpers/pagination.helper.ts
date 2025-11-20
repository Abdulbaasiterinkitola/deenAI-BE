export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const computePaginationMeta = (
  total: number,
  limit: number,
  page: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    limit,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};
