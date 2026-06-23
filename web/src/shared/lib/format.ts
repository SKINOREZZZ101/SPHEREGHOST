// Formatting helpers shared across the Ghost Sphere UI.

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

/** Human-readable bytes, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number | null | undefined, fractionDigits = 1): string {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const negative = bytes < 0;
  const abs = Math.abs(bytes);
  const i = Math.min(Math.floor(Math.log(abs) / Math.log(1024)), UNITS.length - 1);
  const value = abs / Math.pow(1024, i);
  const formatted = value.toFixed(i === 0 ? 0 : fractionDigits);
  return `${negative ? '-' : ''}${formatted} ${UNITS[i]}`;
}

/** Compact number, e.g. 12500 -> "12.5K". */
export function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n) < 1000) return String(n);
  const units = ['', 'K', 'M', 'B', 'T'];
  const i = Math.min(Math.floor(Math.log10(Math.abs(n)) / 3), units.length - 1);
  const value = n / Math.pow(1000, i);
  return `${value.toFixed(value < 10 ? 1 : 0)}${units[i]}`;
}

export function formatPercent(value: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function clampPercent(value: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

/** Relative time using Intl.RelativeTimeFormat (locale-aware). */
export function timeAgo(date: string | number | Date | null | undefined, locale = 'ru'): string {
  if (!date) return '—';
  const d = new Date(date).getTime();
  if (Number.isNaN(d)) return '—';
  const diff = d - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return rtf.format(Math.round(diff / 1000), 'second');
  if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute');
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), 'day');
  return new Date(date).toLocaleDateString(locale);
}

export function formatDate(date: string | number | Date | null | undefined, locale = 'ru'): string {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(
  date: string | number | Date | null | undefined,
  locale = 'ru',
): string {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Uptime seconds -> "3d 4h 12m". */
export function formatUptime(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m || parts.length === 0) parts.push(`${m}m`);
  return parts.join(' ');
}

export function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '🏳️';
  const base = 0x1f1e6;
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    base + (upper.charCodeAt(0) - 65),
    base + (upper.charCodeAt(1) - 65),
  );
}

/** Deterministic hue from a string — used for avatars / node accents. */
export function hueFromString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/**
 * Copies text to the clipboard, working in BOTH secure (HTTPS/localhost) and
 * insecure (plain http://IP) contexts. `navigator.clipboard` is only available
 * in secure contexts, so over HTTP we fall back to a hidden textarea +
 * document.execCommand('copy'), which works everywhere.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
