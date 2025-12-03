/**
 * Type definition for creating a new reflection
 */
export type QuranReflectionType = {
  type: 'quran';
  surah: number;
  startAyah: number;
  endAyah: number;
};

export type HadithReflectionType = {
  type: 'hadith';
  hadithNumber: number;
  collectionId: string;
  bookNumber: number;
};

export type CreateReflectionType = (
  | QuranReflectionType
  | HadithReflectionType
) & {
  content: string;
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
  search?: string;
};

/**
 * Type definition for reflection response
 */
export type ReflectionResponseType = {
  id: string;
  content: string;
  type: 'quran' | 'hadith';
  surah?: number | null;
  startAyah?: number | null;
  endAyah?: number | null;
  collectionId?: string | null;
  hadithNumber?: number | null;
  bookNumber?: number | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
