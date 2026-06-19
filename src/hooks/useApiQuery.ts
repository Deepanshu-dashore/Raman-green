"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { get } from "@/lib/axios";

/**
 * A type-safe custom wrapper hook for TanStack Query (React Query)
 * which reduces boilerplate code for GET API requests.
 *
 * @param queryKey - Unique cache key array for the request
 * @param url - The endpoint URL to fetch from
 * @param params - Optional query parameters
 * @param options - Custom TanStack Query options (excluding queryKey and queryFn)
 */
export function useApiQuery<TData = any, TError = Error>(
  queryKey: any[],
  url: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn">
) {
  return useQuery<TData, TError>({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const response = await get<TData>(url, { params });
      return response.data;
    },
    ...options,
  });
}
