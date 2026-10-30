"use client";
import { motion } from "framer-motion";
import { MealTrigger } from "../../../MealTrigger";
import { lockPageScroll } from "@/lib/scroll-lock";
import { trapDialogFocus } from "@/lib/dialog";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarBlankIcon, MagnifyingGlassIcon, ForkKnifeIcon, XIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { formatDate, localDate, parseDate } from "@/lib/calendar";
import type { Meal } from "@/lib/api/types";
import type { SearchProps, SearchResponse } from "./types";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function datesForQuery(query: string, today: string) {
  const base = parseDate(today);
  if (!base) return [];
  const suggestions = [0, 1, -1].map((offset) => {
    const day = new Date(base);
    day.setDate(day.getDate() + offset);
    return { date: localDate(day), label: offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : "Ontem" };
  });
  if (!query.trim()) return suggestions;
  let exact = parseDate(query.trim());
  const match = query.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
  if (match) exact = parseDate(`${match[3] ?? base.getFullYear()}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`);
  if (exact) return [{ date: localDate(exact), label: formatDate(localDate(exact), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) }];
  return suggestions.filter((item) => normalize(`${item.label} ${formatDate(item.date)}`).includes(normalize(query)));
}

export function Search({ date, userId }: SearchProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [today, setToday] = useState("");
  const normalizedQuery = query.trim();
  const selectedDate = date || today;
  const resultKey = normalizedQuery ? `query:${normalizedQuery}` : `day:${selectedDate}:${userId ?? ""}`;
  const current = response?.key === resultKey ? response : null;
  const dates = datesForQuery(query, today);
  if (!query.trim() && date && date !== today && parseDate(date)) dates.unshift({ date, label: "Dia selecionado" });

  function show() {
    if (dialog.current?.open) return;
    setToday(localDate());
    setQuery("");
    setResponse(null);
    dialog.current?.showModal();
    setOpen(true);
    input.current?.focus();
  }

  function close() { dialog.current?.close(); }

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close(); else trigger.current?.click();
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    const unlock = lockPageScroll();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({ q: normalizedQuery });
      if (!normalizedQuery) {
        params.set("date", selectedDate);
        if (userId) params.set("userId", userId);
      }
      fetch(`/api/search?${params}`, { signal: controller.signal })
        .then(async (result) => {
          if (!result.ok) throw new Error("Search unavailable");
          return result.json() as Promise<{ meals: Meal[]; partial: boolean }>;
        })
        .then((data) => setResponse({ key: resultKey, meals: data.meals, failed: false, partial: data.partial }))
        .catch(() => {
          if (!controller.signal.aborted) setResponse({ key: resultKey, meals: [], failed: true, partial: false });
        });
    }, 250);
    return () => {
      unlock();
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [open, normalizedQuery, attempt, selectedDate, userId, resultKey]);

  function dateHref(value: string) {
    const params = new URLSearchParams({ date: value });
    if (userId) params.set("userId", userId);
    return `/?${params}`;
  }

  return (
    <>
      <button ref={trigger} type="button" onClick={show} aria-haspopup="dialog" aria-expanded={open} aria-controls="global-search" className="flex min-h-10 w-full items-center gap-2 rounded-control border border-border bg-background px-3 text-left text-sm text-muted-foreground hover:border-primary">
        <MagnifyingGlassIcon size={18} aria-hidden="true" />
        <span className="flex-1 truncate">Buscar refeições e datas</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:block">⌘ / Ctrl K</kbd>
      </button>
      <motion.dialog initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : 6 }}
        id="global-search"
        ref={dialog}
        aria-labelledby="search-heading"
        onClose={() => { setOpen(false); if (!document.querySelector("dialog[open]")) trigger.current?.focus(); }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) close();
        }}
        onKeyDown={(event) => {
          trapDialogFocus(event);
          if (event.defaultPrevented) return;
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-search-result]"));
          if (!links.length) return;
          event.preventDefault();
          const index = links.findIndex((link) => link === document.activeElement);
          const next = event.key === "ArrowDown" ? (index + 1) % links.length : (index <= 0 ? links.length - 1 : index - 1);
          links[next].focus();
        }}
        className="fixed inset-0 m-auto max-h-[min(80dvh,42rem)] w-[calc(100%_-_2rem)] max-w-2xl overflow-hidden rounded-panel border border-border bg-surface p-0 text-foreground shadow-popover backdrop:bg-foreground/30 backdrop:backdrop-blur-md"
      >
        <h2 id="search-heading" className="sr-only">Buscar refeições e datas</h2>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <MagnifyingGlassIcon size={20} aria-hidden="true" className="shrink-0 text-muted-foreground" />
          <label htmlFor="global-search-input" className="sr-only">Refeição ou data, por exemplo 02/11/2026</label>
          <input id="global-search-input" ref={input} type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter") { event.preventDefault(); dialog.current?.querySelector<HTMLElement>("[data-search-result]")?.click(); }
          }} placeholder="Busque uma refeição, hoje ou uma data…" autoComplete="off" className="min-w-0 flex-1 bg-transparent py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none" />
          <button type="button" onClick={close} aria-label="Fechar pesquisa" className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted"><XIcon size={18} aria-hidden="true" /></button>
        </div>
        <div className="max-h-[55dvh] min-h-56 space-y-6 overflow-y-auto p-4 sm:p-5">
          {dates.length > 0 && <section aria-labelledby="date-results">
            <h3 id="date-results" className="mb-2 px-2 text-xs font-medium text-muted-foreground">Datas</h3>
            <ul className="space-y-1">{dates.map((item) => <li key={item.date}>
              <Link data-search-result href={dateHref(item.date)} onNavigate={close} className="flex items-center gap-3 rounded-control px-3 py-3 hover:bg-surface-muted focus-visible:bg-primary-muted">
                <span className="rounded-control bg-primary-muted p-2 text-primary-muted-foreground"><CalendarBlankIcon size={20} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.label}</span><span className="text-xs text-muted-foreground">{formatDate(item.date, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span></span>
                <ArrowRightIcon size={16} aria-hidden="true" className="text-muted-foreground" />
              </Link>
            </li>)}</ul>
          </section>}
          <section aria-labelledby="meal-results" aria-busy={!current}>
            <h3 id="meal-results" className="mb-2 px-2 text-xs font-medium text-muted-foreground">{normalizedQuery ? "Refeições em todo o catálogo" : `Refeições de ${selectedDate ? formatDate(selectedDate) : "hoje"}`}</h3>
            {!normalizedQuery && <p className="mb-3 px-2 text-xs text-muted-foreground">Digite um nome para buscar em todo o catálogo.</p>}
            <div role="status" aria-live="polite">
              {!current && <p className="px-3 py-5 text-sm text-muted-foreground">Buscando refeições…</p>}
              {current?.failed && <div className="rounded-control bg-surface-muted p-4"><p className="text-sm text-muted-foreground">Não foi possível consultar as refeições. Você ainda pode buscar datas.</p><button type="button" onClick={() => { setResponse(null); setAttempt(attempt + 1); }} className="mt-3 rounded-control text-sm font-medium text-primary">Tentar novamente</button></div>}
              {current && !current.failed && current.meals.length === 0 && <p className="px-3 py-5 text-sm text-muted-foreground">{normalizedQuery ? "Nenhuma refeição encontrada." : "Nenhuma refeição planejada para este dia."}</p>}
            </div>
            {current?.partial && <p role="status" className="mb-2 px-3 text-xs text-warning">Parte das refeições do dia está indisponível.</p>}
            <ul className="space-y-1">{current?.meals.slice(0, 30).map((meal) => <li key={meal.id}>
              <MealTrigger meal={meal} searchResult onOpen={close} className="flex w-full items-center gap-3 rounded-control px-3 py-3 text-left hover:bg-surface-muted focus-visible:bg-primary-muted">
                <span className="rounded-control bg-accent-muted p-2 text-accent"><ForkKnifeIcon size={20} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{meal.name}</span><span className="block truncate text-xs text-muted-foreground">{meal.description}</span></span>
                <ArrowRightIcon size={16} aria-hidden="true" className="text-muted-foreground" />
              </MealTrigger>
            </li>)}</ul>
            {normalizedQuery && current && current.meals.length > 30 && <Link href={`/refeicoes?name=${encodeURIComponent(normalizedQuery)}`} onNavigate={close} className="mt-3 inline-block rounded-control px-3 text-sm text-primary">Ver todas as refeições</Link>}
          </section>
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground"><span>↑ ↓ para navegar · Enter para abrir</span><span>Esc para fechar</span></footer>
      </motion.dialog>
    </>
  );
}