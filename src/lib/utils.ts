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