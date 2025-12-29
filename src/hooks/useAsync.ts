// src/renderer/hooks/useAsync.ts
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../context/SnackbarContext";

export function useAsync<T = any>(
  promiseFactory: () => Promise<T>,
  deps: any[] = []
) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const {showSnackbar}  = useSnackbar();

const load = useCallback(() => {
  setLoading(true);
  setError(null);

  try {
    return Promise.resolve(promiseFactory())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  } catch (err : any) {
    setError(err);
    showSnackbar(err ,'error')
    setLoading(false);
    return Promise.reject(err);
  }
}, deps);


  // initial call
  useEffect(() => {
    load();
  }, [load]);

  return { loading, data, error, reload: load };
}
