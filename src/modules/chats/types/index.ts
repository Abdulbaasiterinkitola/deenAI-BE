export type QuranReference = {
  type: 'quran';
  surah: number;
  startAyah: number;
  endAyah: number;
};

export type HadithReference = {
  type: 'hadith';
  collection: string; // e.g., "Sahih Bukhari", "Sahih Muslim"
  hadithNumber: number | string; // Can be a number or string like "1.2.3"
  bookNumber?: number; // Optional: book number within the collection
  chapterNumber?: number; // Optional: chapter number within the book
};

export type AIReference = QuranReference | HadithReference;

export type AIResponseType = {
  content: string;
  references: AIReference[]; // Required: at least one reference must be present
};

export type AIResponseType = {
  content: string;
  references: AIReference[]; // Required: at least one reference must be present
};

export interface SseMessage {
  data: string;
}
