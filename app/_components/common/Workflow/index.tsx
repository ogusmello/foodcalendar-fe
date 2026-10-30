"use client";
import { motion } from "framer-motion";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";
import { lockPageScroll } from "@/lib/scroll-lock";
import { trapDialogFocus } from "@/lib/dialog";
import { WorkflowForm } from "./parts/WorkflowForm";
import type { WorkflowContextValue, WorkflowProviderProps, WorkflowRequest, WorkflowTriggerProps } from "./types";

const Context = createContext<WorkflowContextValue | null>(null);
const titles = {
  user: "Adicionar pessoa", meal: "Nova refeição", plan: "Adicionar ao calendário", clone: "Copiar período",
  "edit-user": "Editar pessoa", "edit-plan": "Editar planejamento",
  "delete-user": "Excluir pessoa", "delete-meal": "Excluir refeição", "delete-plan": "Excluir planejamento",
};
export function useWorkflow() {
  const value = useContext(Context);
  if (!value) throw new Error("WorkflowProvider required");
  return value;
}
export function WorkflowTrigger({ request, children, className }: WorkflowTriggerProps) {
  const { open } = useWorkflow();
  return <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="button" aria-haspopup="dialog" onClick={() => open(request)} className={className ?? "rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"}>{children}</motion.button>;
}
export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const opened = request !== null;
  useEffect(() => {
    if (!opened) return;
    dialog.current?.showModal();
    const unlock = lockPageScroll();
    return unlock;
  }, [opened]);
  function close() { if (!busy) dialog.current?.close(); }
  return <Context.Provider value={{ open(value) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRequest(value);
  } }}>
    {children}
    <motion.dialog onKeyDown={trapDialogFocus} initial={false} animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 6 }} ref={dialog} aria-labelledby="workflow-title" onCancel={event => { if (busy) event.preventDefault(); }} onClose={() => { setRequest(null); opener.current?.focus(); }} onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
    }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-panel border border-border bg-surface p-0 text-foreground shadow-popover backdrop:bg-foreground/30 backdrop:backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-border px-5 py-4"><h2 id="workflow-title" className="text-sm font-semibold">{request ? titles[request.kind] : ""}</h2><button type="button" disabled={busy} onClick={close} aria-label="Fechar formulário" className="flex size-9 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted disabled:opacity-50"><XIcon size={18} aria-hidden="true" /></button></header>
      {request && <WorkflowForm request={request} onClose={close} onBusy={setBusy} onChanged={() => { window.dispatchEvent(new Event("foodist:meals-updated")); router.refresh(); }} />}
    </motion.dialog>
  </Context.Provider>;
}