"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useFetch(path, { auth = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setData(await api(path, { auth }));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [path, auth]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
