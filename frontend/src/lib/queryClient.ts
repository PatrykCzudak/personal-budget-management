import { QueryClient, QueryFunction } from '@tanstack/react-query';
import { apiUrl } from './api';

async function throwIfNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Pomocniczy klient API – opakowanie fetch z rzucaniem błędów
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const res = await fetch(apiUrl(url), {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',  // jeśli korzystamy z uwierzytelniania przez ciasteczka
  });
  await throwIfNotOk(res);
  return res;
}

// Domyślna funkcja zapytania dla React Query (GET)
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const res = await fetch(apiUrl(queryKey.join('/') as string), { credentials: 'include' });
  if (res.status === 401) {
    // Obsługa braku autoryzacji - można rozszerzyć
    return Promise.reject(new Error('Unauthorized'));
  }
  await throwIfNotOk(res);
  return res.json();
};

// Inicjalizacja QueryClient z domyślnymi opcjami
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
