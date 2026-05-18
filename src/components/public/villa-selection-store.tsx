"use client";

import { useEffect, useState } from "react";

const FAVORITES_KEY = "villawe:favorites";
const COMPARE_KEY = "villawe:compare";
const STORAGE_EVENT = "villawe:selection-changed";
const MAX_COMPARE_COUNT = 4;

function readIds(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function toggleFavorite(villaId: string) {
  const current = readIds(FAVORITES_KEY);
  const next = current.includes(villaId)
    ? current.filter((id) => id !== villaId)
    : [...current, villaId];
  writeIds(FAVORITES_KEY, next);
}

export function toggleCompare(villaId: string) {
  const current = readIds(COMPARE_KEY);

  if (current.includes(villaId)) {
    writeIds(
      COMPARE_KEY,
      current.filter((id) => id !== villaId),
    );
    return { added: false, limitReached: false };
  }

  if (current.length >= MAX_COMPARE_COUNT) {
    return { added: false, limitReached: true };
  }

  writeIds(COMPARE_KEY, [...current, villaId]);
  return { added: true, limitReached: false };
}

export function useFavoriteIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(readIds(FAVORITES_KEY));
    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return ids;
}

export function useCompareIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(readIds(COMPARE_KEY));
    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return ids;
}

export function getCompareLimit() {
  return MAX_COMPARE_COUNT;
}
