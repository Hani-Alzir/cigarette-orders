import { CsvItem } from '../data/models';

export interface AppState {
  quantities: Record<string, number>;
  activeCategory: 'drehtabak' | 'stopftabak' | 'zigaretten' | 'zubehor' | null;
  items: {
    drehtabak: CsvItem[] | null;
    stopftabak: CsvItem[] | null;
    zigaretten: CsvItem[] | null;
    zubehor: CsvItem[] | null;
  };
  loading: boolean;
  error: string | null;
}

export type Action =
  | { type: 'SET_QUANTITY'; payload: { item: CsvItem; quantity: number } }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: AppState['activeCategory'] }
  | { type: 'SET_ITEMS'; payload: { category: keyof AppState['items']; items: CsvItem[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'NEW_ORDER' };
