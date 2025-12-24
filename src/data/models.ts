export interface Model {
  id: string;
  name: string;
  serialNumber: string;
}

export interface Brand {
  id: string;
  name: string;
  models: Model[];
}

// --- CSV dynamic loading (drehtabak, stopftabak, zigaretten) ---
export interface CsvItem {
  name: string;
  serialNumber: string;
  category: 'drehtabak' | 'stopftabak' | 'zigaretten' | 'zubehor';
}
