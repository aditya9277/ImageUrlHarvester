import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
}

export function parseUrls(input: string): string[] {
  if (!input.trim()) return [];
  
  // Split by commas or newlines
  const urls = input
    .split(/[\n,]+/)
    .map(url => url.trim())
    .filter(url => url.length > 0);
  
  // Add http:// prefix if missing
  return urls.map(url => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  });
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getDomainFromUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (err) {
    return url;
  }
}
