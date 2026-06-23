/** Extracts an array from a Remnawave response that may be enveloped under a key. */
export function pickArray(raw: any, keys: string[]): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    for (const k of keys) {
      if (Array.isArray(raw[k])) return raw[k];
    }
  }
  return [];
}
