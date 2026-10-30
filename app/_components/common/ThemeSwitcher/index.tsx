"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import type { ThemePreference, ThemeSwitcherProps } from "./types";

const storageKey = "foodist-theme";
const changeEvent = "foodist-theme-change";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark";
}

function getPreference(): ThemePreference {
  const value = document.documentElement.dataset.themePreference ?? null;
  return isThemePreference(value) ? value : "dark";
}

function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference;
}

function subscribe(onChange: () => void) {
  function syncStorage(event: StorageEvent) {
    if (event.key !== storageKey && event.key !== null) return;
    applyTheme(isThemePreference(event.newValue) ? event.newValue : "dark");
    onChange();
  }
  window.addEventListener("storage", syncStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", syncStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}

function getServerPreference(): ThemePreference {
  return "dark";
}

export function ThemeSwitcher({ variant = "select" }: ThemeSwitcherProps) {
  const preference = useSyncExternalStore(subscribe, getPreference, getServerPreference);

  function changeTheme(value: string) {
    if (!isThemePreference(value)) return;
    applyTheme(value);
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // The theme remains usable when persistence is unavailable.
    }
    window.dispatchEvent(new Event(changeEvent));
  }

  if (variant === "icon") {
    const labels = { light: "Claro", dark: "Escuro" };
    const next = preference === "light" ? "dark" : "light";
    const Icon = preference === "light" ? SunIcon : MoonIcon;
    return (
      <button type="button" onClick={() => changeTheme(next)} aria-label={`Tema: ${labels[preference]}. Alterar para ${labels[next]}.`} title={`Tema: ${labels[preference]} · Alterar para ${labels[next]}`} className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground">
        <Icon size={20} aria-hidden="true" />
      </button>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Tema</span>
      <select aria-label="Tema"
        value={preference}
        onChange={(event) => changeTheme(event.target.value)}
        className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground"
      >
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
    </label>
  );
}
