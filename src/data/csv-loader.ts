import { CsvItem } from './models';

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
    drehtabak: 'Drehtabak Sheet1.csv',
    stopftabak: 'Stopftabak Data.csv',
    zigaretten: 'Zigaretten Data.csv',
    zubehor: 'Zubeh\u00f6r Sheet1.csv'
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
