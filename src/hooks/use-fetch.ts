import { useEffect, useState } from "react";

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseFetchState<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchFn()
      .then((data) => {
        if (!isMounted) return;
        setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!isMounted) return;
        const error =
          err instanceof Error ? err : new Error("Failed to fetch data");
        setState({ data: null, loading: false, error });
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

