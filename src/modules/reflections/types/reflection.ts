/**
 * Type definition for creating a new reflection
 */
export type CreateReflectionType = {
  content: string;
  userId: string;
};

/**
 * Type definition for updating a reflection
 */
export type UpdateReflectionType = {
  content?: string;
};

/**
 * Type definition for reflection query parameters
 */
export type ReflectionQueryType = {
  page?: number;
  limit?: number;
  orderBy?: 'ASC' | 'DESC';
};

/**
 * Type definition for reflection response
 */
export type ReflectionResponseType = {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};