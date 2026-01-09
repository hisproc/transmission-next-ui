import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {TorrentLabel} from "@/lib/utils/torrentLabel.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseLabel(label: string) : TorrentLabel | null {
  try {
    return JSON.parse(label) as TorrentLabel
  }
  catch (error) {
    console.error("Error parsing labels:", error);
    return null;
  }
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // 去掉 "data:application/x-bittorrent;base64," 这样的前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file); // 👈 转成 base64
  });
};

export function isFontAvailable(fontName: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const testString = "abcdefghijklmnopqrstuvwxyz0123456789";
  const baseFonts = ["monospace", "sans-serif", "serif"];

  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.left = "-9999px";
  span.style.fontSize = "72px";
  span.innerText = testString;

  document.body.appendChild(span);

  const defaultMetrics: Record<string, { width: number; height: number }> = {};

  for (const base of baseFonts) {
    span.style.fontFamily = base;
    defaultMetrics[base] = {
      width: span.offsetWidth,
      height: span.offsetHeight,
    };
  }

  let available = false;

  for (const base of baseFonts) {
    span.style.fontFamily = `'${fontName}', ${base}`;
    const width = span.offsetWidth;
    const height = span.offsetHeight;
    const metrics = defaultMetrics[base];
    if (width !== metrics.width || height !== metrics.height) {
      available = true;
      break;
    }
  }

  document.body.removeChild(span);
  return available;
}