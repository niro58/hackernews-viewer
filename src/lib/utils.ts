import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ResultFetch } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function safeFetch<T>(request: Promise<Response>): Promise<ResultFetch<T>> {
  try {
    const response = await request;
    return handleApiResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    return { type: 'FAILURE', error: 'Network error or invalid response' };
  }
}
export async function handleApiResponse<T>(response: Response): Promise<ResultFetch<T>> {
  if (response.status !== 200) {
    return { type: 'FAILURE', error: 'status text is not OK' };
  }
  const data = await response.json();

  if (data?.error) {
    return { type: 'FAILURE', error: data.error };
  }
  return { type: 'SUCCESS', data: data as T };
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getTimeAgo(timestamp: number) {
  const nowUnix = Math.floor(Date.now() / 1000)
  const seconds = nowUnix - timestamp
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
export function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };