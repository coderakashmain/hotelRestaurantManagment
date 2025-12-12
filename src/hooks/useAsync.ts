// src/renderer/hooks/useAsync.ts
import { useState, useEffect, useCallback } from "react";

export function useAsync<T = any>(
  promiseFactory: () => Promise<T>,
  deps: any[] = []
) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    return promiseFactory()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, deps);

  // initial call
  useEffect(() => {
    load();
  }, [load]);

  return { loading, data, error, reload: load };
}
