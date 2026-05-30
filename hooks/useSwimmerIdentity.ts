"use client";

import { useCallback, useSyncExternalStore } from "react";

const SWIMMER_NAME_STORAGE_KEY = "100miles-sfbay.swimmerName";
const SWIMMER_NAME_CHANGE_EVENT = "100miles-sfbay.swimmerNameChange";

function getStoredSwimmerName() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SWIMMER_NAME_STORAGE_KEY)?.trim() ?? "";
}

function subscribeToSwimmerNameChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SWIMMER_NAME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SWIMMER_NAME_CHANGE_EVENT, onStoreChange);
  };
}

export function useSwimmerIdentity() {
  const swimmerName = useSyncExternalStore(
    subscribeToSwimmerNameChanges,
    getStoredSwimmerName,
    () => "",
  );

  const saveSwimmerName = useCallback((value: string) => {
    const nextName = value.trim();

    if (!nextName) {
      return false;
    }

    window.localStorage.setItem(SWIMMER_NAME_STORAGE_KEY, nextName);
    window.dispatchEvent(new Event(SWIMMER_NAME_CHANGE_EVENT));
    return true;
  }, []);

  return {
    swimmerName,
    isLoaded: true,
    saveSwimmerName,
  };
}
