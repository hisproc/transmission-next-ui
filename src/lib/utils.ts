import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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