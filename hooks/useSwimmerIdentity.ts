"use client";

import { useCallback, useEffect, useState } from "react";

const SWIMMER_NAME_STORAGE_KEY = "100miles-sfbay.swimmerName";

export function useSwimmerIdentity() {
  const [swimmerName, setSwimmerName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSwimmerName(window.localStorage.getItem(SWIMMER_NAME_STORAGE_KEY)?.trim() ?? "");
    setIsLoaded(true);
  }, []);

  const saveSwimmerName = useCallback((value: string) => {
    const nextName = value.trim();

    if (!nextName) {
      return false;
    }

    window.localStorage.setItem(SWIMMER_NAME_STORAGE_KEY, nextName);
    setSwimmerName(nextName);
    return true;
  }, []);

  return {
    swimmerName,
    isLoaded,
    saveSwimmerName,
  };
}
