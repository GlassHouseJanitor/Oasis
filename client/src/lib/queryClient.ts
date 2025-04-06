import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
url: string, p0: string, p1: { paymentStatus: string; firstName: string; lastName: string; email?: string | undefined; phone?: string | undefined; emergencyContact?: string | undefined; notes?: string | undefined; photoUrl?: string | undefined; }, options?: RequestInit,
): Promise<any> {
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: options?.body ? { "Content-Type": "application/json", ...options?.headers } : options?.headers || {},
    body: options?.body,
    credentials: "include",
    ...options,
  });

  await throwIfResNotOk(res);
  return res.json().catch(() => null);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
