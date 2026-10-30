"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { MealFormProps } from "./types";

export function MealForm({ meal, onSaved, onCancel, onBusyChange }: MealFormProps) {
  const id = useId();
  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Informe o nome da refeição.";
    else if (name.trim().length > 255) nextErrors.name = "Use no máximo 255 caracteres.";
    if (!description.trim()) nextErrors.description = "Informe uma descrição.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const changes: Record<string, string> = {};
    if (name.trim() !== meal.name) changes.name = name.trim();
    if (description.trim() !== meal.description) changes.description = description.trim();
    if (!Object.keys(changes).length) { onCancel(); return; }
    setPending(true);
    onBusyChange(true);
    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok) {
        const fields: Record<string, string> = {};
        for (const field of ["name", "description"]) if (typeof data[field] === "string") fields[field] = data[field];
        setErrors(Object.keys(fields).length ? fields : { form: typeof data.message === "string" ? data.message : "Não foi possível salvar a refeição." });
        return;
      }
      if (typeof data.name !== "string" || typeof data.description !== "string" || data.id !== meal.id) throw new Error("Invalid response");
      onSaved(data);
    } catch {
      setErrors({ form: "Não foi possível salvar. Verifique a conexão e tente novamente." });
    } finally {
      setPending(false);
      onBusyChange(false);
    }
  }

  return <form onSubmit={submit} className="space-y-4">
    <div>
      <label htmlFor={id + "-name"} className="mb-2 block text-xs font-medium">Nome da refeição</label>
      <input id={id + "-name"} autoFocus value={name} onChange={event => setName(event.target.value)} maxLength={255} disabled={pending} aria-invalid={!!errors.name} aria-describedby={errors.name ? id + "-name-error" : undefined} className="w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60" />
      {errors.name && <p id={id + "-name-error"} className="mt-1 text-xs text-danger">{errors.name}</p>}
    </div>
    <div>
      <label htmlFor={id + "-description"} className="mb-2 block text-xs font-medium">Descrição</label>
      <textarea id={id + "-description"} value={description} onChange={event => setDescription(event.target.value)} rows={4} disabled={pending} aria-invalid={!!errors.description} aria-describedby={errors.description ? id + "-description-error" : undefined} className="w-full resize-y rounded-control border border-border bg-surface px-3 py-2.5 text-sm disabled:opacity-60" />
      {errors.description && <p id={id + "-description-error"} className="mt-1 text-xs text-danger">{errors.description}</p>}
    </div>
    <p className="text-xs leading-5 text-muted-foreground">A alteração vale para todos os planejamentos que usam esta refeição.</p>
    {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} disabled={pending} className="rounded-control border border-border px-4 py-2 text-sm disabled:opacity-50">Cancelar</button>
      <button type="submit" disabled={pending} className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{pending ? "Salvando…" : "Salvar alterações"}</button>
    </div>
  </form>;
}