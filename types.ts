
export interface Book {
  id: number;
  title: string;
  summary: string;
  keyCharacters: string[];
  beats: string[];
  moral: string;
  coverImage?: string;
  isGenerating?: boolean;
}

export interface BookPage {
  pageNumber: number;
  title: string;
  imageDescription: string;
  narration: string;
  dialogue: string;
  vocabularyNote?: string;
  imageUrl?: string;
  isPainting?: boolean;
}

export interface SeriesBible {
  characters: { name: string; description: string; visuals: string }[];
  locations: { name: string; description: string }[];
  props: { name: string; description: string }[];
}

export enum AppView {
  LIBRARY = 'LIBRARY',
  READER = 'READER',
  BIBLE = 'BIBLE'
}
