"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ForkKnifeIcon, PencilSimpleIcon, XIcon } from "@phosphor-icons/react";
import { mealCategories } from "@/lib/meals";
import { formatDate } from "@/lib/calendar";
import { lockPageScroll } from "@/lib/scroll-lock";
import { useWorkflow } from "../Workflow";
import { MealForm } from "./parts/MealForm";
import type { MealDialogContextValue, MealDialogProps, MealSelection } from "./types";

const MealDialogContext = createContext<MealDialogContextValue | null>(null);

export function useMealDialog() {
  const value = useContext(MealDialogContext);
  if (!value) throw new Error("MealTrigger requires MealDialogProvider");
  return value;
}

export function MealDialogProvider({ children }: MealDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [selection, setSelection] = useState<MealSelection | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const workflow = useWorkflow();

  const selectedId = selection?.meal.id;

  useEffect(() => {
    if (!selectedId) return;
    const element = dialog.current;
    element?.showModal();
    const unlock = lockPageScroll();
    return () => {
      element?.close();
      unlock();
    };
  }, [selectedId]);

  function close() {
    if (busy) return;
    dialog.current?.close();
  }

  const category = mealCategories.find(item => item.type === selection?.context?.mealType);

  return <MealDialogContext.Provider value={{ openMeal(meal, context) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setEditing(false);
    setSaved(false);
    setSelection({ meal, context });
  } }}>
    {children}
    <dialog ref={dialog} aria-labelledby="meal-dialog-title" onCancel={event => { if (busy) event.preventDefault(); }} onClose={() => {
      setSelection(null);
      setEditing(false);
      opener.current?.focus();
    }} onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
    }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-panel border border-border bg-surface p-0 text-foreground shadow-popover backdrop:bg-foreground/30 backdrop:backdrop-blur-md">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 id="meal-dialog-title" className="text-sm font-medium">{editing ? "Editar refeição" : "Detalhes da refeição"}</h2>
        <button type="button" onClick={close} disabled={busy} aria-label="Fechar detalhes da refeição" className="flex size-9 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted disabled:opacity-50"><XIcon size={18} aria-hidden="true" /></button>
      </header>
      {selection && <div className="p-5 sm:p-6">
        <div className={`mb-5 rounded-card p-5 ${category?.color ?? "bg-surface-muted text-foreground"}`}>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium"><ForkKnifeIcon size={20} aria-hidden="true" /><span>{category?.label ?? "Refeição"}</span></div>
          <h3 className="text-xl font-semibold tracking-tight">{selection.meal.name}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selection.meal.description}</p>
          {(selection.context?.userName || selection.context?.date) && <p className="mt-4 text-xs">{[selection.context.userName, selection.context.date ? formatDate(selection.context.date, { day: "numeric", month: "long", year: "numeric" }) : null].filter(Boolean).join(" · ")}</p>}
        </div>
        {editing ? <MealForm key={selection.meal.id} meal={selection.meal} onCancel={() => setEditing(false)} onBusyChange={setBusy} onSaved={meal => {
          setSelection(current => current ? { ...current, meal } : null);
          setEditing(false);
          setSaved(true);
          window.dispatchEvent(new Event("foodist:meals-updated"));
          router.refresh();
        }} /> : <>
          {saved && <p role="status" className="mb-4 text-xs text-success">Refeição atualizada.</p>}
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => { close(); workflow.open({ kind: "plan", meal: selection.meal, date: selection.context?.date, mealType: selection.context?.mealType, userId: selection.context?.plan ? String(selection.context.plan.user.id) : undefined }); }} className="rounded-control border border-border px-3 py-2 text-xs">Planejar esta refeição</button>
            {selection.context?.plan && <><button type="button" onClick={() => { close(); workflow.open({ kind: "edit-plan", plan: selection.context!.plan }); }} className="rounded-control border border-border px-3 py-2 text-xs">Editar planejamento</button><button type="button" onClick={() => { close(); workflow.open({ kind: "delete-plan", plan: selection.context!.plan }); }} className="rounded-control px-3 py-2 text-xs text-danger">Excluir planejamento</button></>}
            <button type="button" onClick={() => { close(); workflow.open({ kind: "delete-meal", meal: selection.meal }); }} className="rounded-control px-3 py-2 text-xs text-danger">Excluir refeição</button>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className="rounded-control border border-border px-4 py-2 text-sm">Fechar</button>
            <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><PencilSimpleIcon size={16} aria-hidden="true" />Editar refeição</button>
          </div>
        </>}
      </div>}
    </dialog>
  </MealDialogContext.Provider>;
}