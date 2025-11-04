// Auto-generated from Zigaretten-Table 1.csv
// Only brand, model name, and serial number are included

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

export const cigaretteData: Brand[] = [
  {
    id: "marlboro",
    name: "Marlboro",
    models: [
      { id: "marlboro-mix-12", name: "Marlboro Mix 12", serialNumber: "23866" },
      { id: "marlboro-red-10-euro", name: "Marlboro red 10 €", serialNumber: "23171" },
      { id: "marlboro-gold-10-euro", name: "Marlboro Gold 10 €", serialNumber: "23172" },
      { id: "marlboro-mix-9-euro", name: "Marlboro Mix 9 €", serialNumber: "7408" },
      { id: "marlboro-gold-20", name: "Marlboro Gold 20", serialNumber: "24098" },
      { id: "marlboro-gold-12", name: "Marlboro Gold 12", serialNumber: "23432" },
      { id: "marlboro-gold-15", name: "Marlboro Gold 15", serialNumber: "23635" },
    ],
  },
  {
    id: "winston",
    name: "Winston",
    models: [
      { id: "winston-rot-20", name: "Winston rot 20", serialNumber: "23614" },
      { id: "winston-rot-10", name: "Winston Rot 10", serialNumber: "23228" },
      { id: "winston-rot-10-long", name: "Winston rot 10 Long", serialNumber: "182" },
      { id: "winston-black-10", name: "Winston Black 10", serialNumber: "23124" },
    ],
  },
  {
    id: "camel",
    name: "Camel",
    models: [
      { id: "camel-yellow-20", name: "Camel yellow 20", serialNumber: "23612" },
      { id: "camel-yellow-10", name: "Camel Yellow 10", serialNumber: "23190" },
      { id: "camel-blue-10", name: "Camel Blue 10", serialNumber: "23191" },
    ],
  },
  {
    id: "lm",
    name: "LM",
    models: [
      { id: "lm-red-28", name: "LM red 28", serialNumber: "24334" },
      { id: "lm-blue-10-euro", name: "LM Blue 10 €", serialNumber: "1117" },
    ],
  },
  {
    id: "paramount",
    name: "Paramount",
    models: [
      { id: "paramount-red-1990", name: "Paramount red 19,90", serialNumber: "24189" },
    ],
  },
  {
    id: "pallmall",
    name: "Pall Mall",
    models: [
      { id: "pall-mall-blue-cigarillos", name: "Pall Mall Blue Cigarillos", serialNumber: "19784" },
    ],
  },
  {
    id: "davidoff",
    name: "Davidoff",
    models: [
      { id: "davidoff-gold", name: "Davidoff Gold", serialNumber: "8421" },
      { id: "davidoff-gold-slim", name: "Davidoff Gold Slim", serialNumber: "19851" },
    ],
  },
  {
    id: "lucky",
    name: "Lucky",
    models: [
      { id: "lucky-red-22-euro", name: "Lucky Red 22 €", serialNumber: "24130" },
      { id: "lucky-red-15-euro", name: "Lucky red 15 €", serialNumber: "23495" },
      { id: "lucky-red-ohne", name: "Lucky red Ohne", serialNumber: "23515" },
    ],
  },
  {
    id: "vogue",
    name: "Vogue",
    models: [
      { id: "vogue-lila-slim", name: "Vogue Lila Slim", serialNumber: "22956" },
    ],
  },
  {
    id: "gauloises",
    name: "Gauloises",
    models: [
      { id: "gauloises-red-15-euro", name: "Gauloises red 15€", serialNumber: "23625" },
      { id: "gauloises-red-9-ohne", name: "Gauloises red 9 Ohne", serialNumber: "22493" },
    ],
  },
  {
    id: "delia",
    name: "Delia",
    models: [
      { id: "delia-green", name: "Delia Green", serialNumber: "3835" },
      { id: "delia-gold", name: "Delia Gold", serialNumber: "3792" },
    ],
  },
  {
    id: "terea",
    name: "Terea",
    models: [
      { id: "terea-amber", name: "Terea Amber", serialNumber: "24280" },
      { id: "terea-turqoise", name: "Terea Turqoise", serialNumber: "24279" },
      { id: "terea-sienna", name: "Terea Sienna", serialNumber: "24283" },
    ],
  },
  {
    id: "pueblo",
    name: "Pueblo",
    models: [
      { id: "pueblo-classic", name: "Pueblo Classic", serialNumber: "22741" },
    ],
  },
  {
    id: "magnum",
    name: "Magnum",
    models: [
      { id: "magnum-red-8", name: "Magnum red 8", serialNumber: "49092" },
    ],
  },
  {
    id: "west",
    name: "West",
    models: [
      { id: "west-red-10", name: "West Red 10", serialNumber: "23220" },
    ],
  },
];

// --- CSV dynamic loading (drehtabak, stopftabak, zigaretten) ---
export interface CsvItem {
  name: string;
  serialNumber: string;
  category: 'drehtabak' | 'stopftabak' | 'zigaretten' | 'zubehor';
}

// Generic CSV parser: expects lines in format NAME;SERIAL
function parseSimpleCsv(text: string, category: CsvItem['category']): CsvItem[] {
  // Strip potential UTF-8 BOM
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  // If HTML accidentally returned
  if (/<!DOCTYPE html>|<html/i.test(text.slice(0, 500))) {
    console.warn(`CSV parser: HTML content detected instead of CSV for category '${category}'.`);
    return [];
  }
  const lines = text.split(/\r?\n/);
  // Detect delimiter: choose the one with more splits in first non-empty line
  const sample = lines.find(l => l.trim().length > 0) || '';
  let delimiter = ';';
  const semi = sample.split(';').length;
  const comma = sample.split(',').length;
  if (comma > semi) delimiter = ',';
  const items: CsvItem[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(delimiter);
    if (parts.length < 2) continue; // need at least name + serial
    const nameRaw = parts[0];
    const serialRaw = parts[1];
    const name = (nameRaw || '').trim();
    const serialNumber = (serialRaw || '').trim();
    if (!name || !serialNumber) continue;
    // Filter out obvious header words if present (unlikely here)
    if (/^name$/i.test(name) && /serial/i.test(serialNumber)) continue;
    items.push({ name, serialNumber, category });
  }
  if (items.length === 0) {
    console.warn(`CSV parser: no rows parsed for category '${category}'. Delim='${delimiter}'. First 5 raw lines:`, lines.slice(0,5));
  }
  return items;
}

async function fetchCsv(path: string): Promise<string> {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load CSV: ${path} status=${res.status}`);
  const text = await res.text();
  return text;
}

export async function loadCsvCategory(category: 'drehtabak' | 'stopftabak' | 'zigaretten' | 'zubehor'): Promise<CsvItem[]> {
  const baseEnv = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  const candidates: string[] = [];
  const filenames: Record<typeof category, string> = {
    drehtabak: 'Drehtabak-Table 1.csv',
    stopftabak: 'Stopftabak-Table 1.csv',
    zigaretten: 'Zigaretten-Table 1.csv',
    zubehor: 'Zubehor-Table 1.csv'
  };
  const file = filenames[category];
  // Add direct path with env base (may be empty)
  candidates.push(`${baseEnv}/data/${file}`.replace(/^\/data/, '/data'));
  // Add root-relative path
  candidates.push(`/data/${file}`);
  // Add app folder heuristic (common when served under repo name)
  if (!baseEnv && typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const first = pathParts[0];
      candidates.push(`/${first}/data/${file}`);
    }
  }
  const tried: { url: string; error: any; rows: number }[] = [];
  const uniqueCandidates: string[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (uniqueCandidates.indexOf(c) === -1) uniqueCandidates.push(c);
  }
  for (let i = 0; i < uniqueCandidates.length; i++) {
    const url = uniqueCandidates[i]; // deduped
    try {
      const text = await fetchCsv(url);
      const parsed = parseSimpleCsv(text, category);
      if (parsed.length > 0) {
        console.info(`CSV load success for '${category}' via ${url} rows=${parsed.length}`);
        return parsed;
      }
      tried.push({ url, error: 'empty/parsed0', rows: 0 });
    } catch (e) {
      tried.push({ url, error: e, rows: 0 });
    }
  }
  console.warn(`All CSV load attempts failed for '${category}'. Attempts:`, tried);
  // Determine best sentinel: if any attempt got HTML (detected earlier) treat as error
  return [{ name: 'Fallback Example', serialNumber: '00000', category }];
}

export async function loadAllCsv(): Promise<{ drehtabak: CsvItem[]; stopftabak: CsvItem[]; zigaretten: CsvItem[]; zubehor: CsvItem[] }> {
  const [drehtabak, stopftabak, zigaretten, zubehor] = await Promise.all([
    loadCsvCategory('drehtabak'),
    loadCsvCategory('stopftabak'),
    loadCsvCategory('zigaretten'),
    loadCsvCategory('zubehor')
  ]);
  return { drehtabak, stopftabak, zigaretten, zubehor };
}
