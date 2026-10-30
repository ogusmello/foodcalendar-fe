"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { mutate, ClientApiError } from "@/lib/api/client";
import { formatDate, parseDate, shiftDays, todayInSaoPaulo } from "@/lib/calendar";
import { mealCategories } from "@/lib/meals";
import type { Meal, MealPlan, User } from "@/lib/api/types";
import type { WorkflowFormProps } from "./types";
import { PlanSummary } from "./parts/PlanSummary";

const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const dayValues = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const inputClass = "w-full rounded-control border border-border bg-background px-3 py-2.5 text-sm disabled:opacity-60";
const secondary = "rounded-control border border-border px-3 py-2 text-xs hover:bg-surface-muted disabled:opacity-50";

export function WorkflowForm({ request, onClose, onBusy, onChanged }: WorkflowFormProps) {
  const id = useId();
  const { kind, plan } = request;
  const isPlan = kind === "plan" || kind === "edit-plan";
  const isDelete = kind.startsWith("delete-") || kind === "reset";
  const [users, setUsers] = useState<User[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(isPlan || kind === "clone");
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState(request.user?.name ?? "");
  const [description, setDescription] = useState("");
  const [people, setPeople] = useState<string[]>(plan ? [String(plan.user.id)] : request.userId ? [request.userId] : []);
  const [mealId, setMealId] = useState(String(plan?.meal.id ?? request.meal?.id ?? ""));
  const [mealQuery, setMealQuery] = useState("");
  const [type, setType] = useState(plan?.mealType ?? request.mealType ?? "LUNCH");
  const [start, setStart] = useState(plan?.startDate ?? request.date ?? todayInSaoPaulo());
  const [end, setEnd] = useState(plan?.endDate ?? request.date ?? todayInSaoPaulo());
  const [repeat, setRepeat] = useState(!!plan && plan.startDate !== plan.endDate);
  const [days, setDays] = useState<string[]>(plan?.targetDays ?? ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]);
  const [origin, setOrigin] = useState("");
  const [inlineMeal, setInlineMeal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [successful, setSuccessful] = useState<string[]>([]);
  const [uncertain, setUncertain] = useState(false);
  const [successDate, setSuccessDate] = useState(request.date ?? todayInSaoPaulo());
  const frozen = pending || successful.length > 0;

  useEffect(() => {
    if (!(isPlan || kind === "clone")) return;
    const controller = new AbortController();
    Promise.all(["users","meals","meal-plans"].map(resource => fetch("/api/" + resource, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error("Options unavailable"); return response.json(); })))
      .then(([people, options, periods]) => { setUsers(people); setMeals(options); setPlans(periods); setLoading(false); })
      .catch(() => { if (!controller.signal.aborted) { setLoadError(true); setLoading(false); } });
    return () => controller.abort();
  }, [isPlan, kind]);

  const finalEnd = repeat || kind === "clone" ? end : start;
  const singleDay = parseDate(start);
  const finalDays = repeat ? days : singleDay ? [dayValues[(singleDay.getDay() + 6) % 7]] : [];
  let occurrences = 0;
  if (parseDate(start) && parseDate(finalEnd) && start <= finalEnd) {
    const totalDays = Math.round((parseDate(finalEnd)!.getTime() - parseDate(start)!.getTime()) / 86400000) + 1;
    occurrences = Math.floor(totalDays / 7) * finalDays.length;
    for (let index = 0; index < totalDays % 7; index++) {
      const day = parseDate(shiftDays(start, index))!;
      if (finalDays.includes(dayValues[(day.getDay() + 6) % 7])) occurrences++;
    }
  }
  const periods = [...new Set(plans.filter(item => people.includes(String(item.user.id))).map(item => item.startDate + "|" + item.endDate))];
  const originPlans = plans.filter(item => people.includes(String(item.user.id)) && item.startDate + "|" + item.endDate === origin);
  const destinationDays = parseDate(start) && parseDate(finalEnd) && start <= finalEnd
    ? Array.from({ length: Math.min(7, Math.round((parseDate(finalEnd)!.getTime() - parseDate(start)!.getTime()) / 86400000) + 1) }, (_, index) => dayValues[(parseDate(shiftDays(start, index))!.getDay() + 6) % 7]) : [];
  const withoutOccurrence = originPlans.filter(item => !item.targetDays.some(day => destinationDays.includes(day))).length;

  function showError(error: unknown) {
    if (error instanceof ClientApiError) {
      const fields: Record<string, string> = { form: error.message };
      for (const [key, value] of Object.entries(error.fields)) if (typeof value === "string") fields[key] = value;
      setErrors(fields);
      if (error.fields.uncertain) setUncertain(true);
    } else setErrors({ form: "Não foi possível concluir. Tente novamente." });
  }
  function busy(value: boolean) { setPending(value); onBusy(value); }
  async function createInlineMeal() {
    setErrors({});
    if (!newName.trim() || !newDescription.trim() || newName.length > 255) { setErrors({ form: "Preencha o nome (até 255 caracteres) e a descrição da nova refeição." }); return; }
    busy(true);
    try {
      const meal = await mutate<Meal>("/meals", "POST", { name: newName.trim(), description: newDescription.trim() });
      setMeals(current => [...current, meal]); setMealId(String(meal.id)); setMealQuery(""); setInlineMeal(false); onChanged();
    } catch (error) { showError(error); } finally { busy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || uncertain) return;
    setErrors({});
    if ((kind === "user" || kind === "edit-user" || kind === "meal") && (!name.trim() || name.length > 255 || (kind === "meal" && !description.trim()))) { setErrors({ form: "Preencha os campos obrigatórios; o nome deve ter até 255 caracteres." }); return; }
    if ((isPlan || kind === "clone") && (!people.length || !parseDate(start) || !parseDate(finalEnd) || start > finalEnd)) { setErrors({ form: "Selecione ao menos uma pessoa e um período válido." }); return; }
    if (isPlan && (!mealId || !finalDays.length || occurrences === 0)) { setErrors({ form: "Selecione uma refeição e dias com pelo menos uma ocorrência no período." }); return; }
    if (kind === "clone" && (!origin || people.some(person => !originPlans.some(item => String(item.user.id) === person)))) { setErrors({ form: "Selecione uma origem com planos para todas as pessoas escolhidas." }); return; }
    busy(true);
    try {
      if (kind === "user" || kind === "edit-user") await mutate(kind === "user" ? "/users" : "/users/" + request.user!.id, kind === "user" ? "POST" : "PUT", { name: name.trim() });
      else if (kind === "meal") await mutate("/meals", "POST", { name: name.trim(), description: description.trim() });
      else if (isPlan || kind === "clone") {
        const completed = [...successful];
        const failures: string[] = [];
        let ambiguous = false;
        for (const person of people.filter(person => !completed.includes(person))) {
          try {
            if (kind === "clone") {
              const [originalStartDate, originalEndDate] = origin.split("|");
              await mutate("/meal-plans/clone", "POST", { userId: Number(person), originalStartDate, originalEndDate, newStartDate: start, newEndDate: finalEnd });
            } else {
              const body = { mealId: Number(mealId), mealType: type, startDate: start, endDate: finalEnd, targetDays: finalDays, ...(kind === "plan" ? { userId: Number(person) } : {}) };
              await mutate(kind === "plan" ? "/meal-plans" : "/meal-plans/" + plan!.id, kind === "plan" ? "POST" : "PATCH", body);
            }
            completed.push(person);
          } catch (error) {
            failures.push((users.find(user => String(user.id) === person)?.name ?? person) + ": " + (error instanceof Error ? error.message : "Não foi possível concluir"));
            if (error instanceof ClientApiError && error.fields.uncertain) ambiguous = true;
          }
        }
        setSuccessful(completed);
        setSuccessDate(start);
        onChanged();
        if (failures.length) {
          setUncertain(ambiguous);
          setErrors({ form: (completed.length ? completed.length + " pessoa(s) concluída(s). " : "") + failures.join(" · ") + (ambiguous ? " Confira o calendário antes de repetir." : " Ao reenviar, apenas as pessoas que falharam serão processadas.") });
          return;
        }
      } else if (isDelete) {
        const resource = kind === "delete-user" ? "/users/" + request.user!.id : kind === "delete-meal" ? "/meals/" + request.meal!.id : kind === "delete-plan" ? "/meal-plans/" + plan!.id : "/demo/reset";
        await mutate(resource, kind === "reset" ? "POST" : "DELETE", kind === "reset" ? {} : undefined);
      }
      setDone(true); onChanged();
    } catch (error) { showError(error); } finally { busy(false); }
  }
  function label(key: string, text: string, control: React.ReactNode) {
    return <div><label htmlFor={id + key} className="mb-1.5 block text-xs font-medium">{text}</label>{control}{errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>}</div>;
  }
  if (done) return <div className="space-y-4 p-5"><p role="status" className="text-sm text-success">Operação concluída.</p>{(isPlan || kind === "clone") && <Link onClick={onClose} href={`/?date=${successDate}&view=week${people.length === 1 ? "&userId=" + people[0] : ""}`} className="block rounded-control text-sm font-medium text-primary">Ver no calendário →</Link>}<button type="button" onClick={onClose} className={secondary}>Concluir</button></div>;
  return <form onSubmit={submit} className="space-y-4 p-5">
    {loading && <p role="status" className="text-sm text-muted-foreground">Carregando opções…</p>}
    {loadError && <p role="alert" className="text-sm text-danger">Não foi possível carregar as opções. Feche e abra o formulário para tentar novamente.</p>}
    <fieldset disabled={frozen || loading || loadError || uncertain} className="space-y-4 disabled:opacity-70">
      {(kind === "user" || kind === "edit-user" || kind === "meal") && label("name", "Nome", <input id={id+"name"} className={inputClass} value={name} onChange={event => setName(event.target.value)} maxLength={255} required autoFocus />)}
      {kind === "meal" && label("description", "Descrição", <textarea id={id+"description"} className={inputClass} rows={4} value={description} onChange={event => setDescription(event.target.value)} required />)}
      {(isPlan || kind === "clone") && <>
        <fieldset><legend className="mb-2 text-xs font-medium">Para quem?</legend><div className="flex flex-wrap gap-2">
          {kind !== "edit-plan" && <button type="button" onClick={() => setPeople(users.map(user => String(user.id)))} className={secondary}>{users.length > 2 ? "Todos" : "Ambos"}</button>}
          {users.map(user => <label key={user.id} className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs"><input type="checkbox" disabled={kind === "edit-plan"} checked={people.includes(String(user.id))} onChange={event => setPeople(current => event.target.checked ? [...current, String(user.id)] : current.filter(person => person !== String(user.id)))} />{user.name}</label>)}
        </div>{users.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Adicione uma pessoa em Configurações para continuar.</p>}</fieldset>
        {isPlan && <>
          {label("mealId", "Refeição", <div className="space-y-2"><input aria-label="Filtrar refeições" className={inputClass} value={mealQuery} onChange={event => setMealQuery(event.target.value)} placeholder="Buscar pelo nome…" /><select id={id+"mealId"} className={inputClass} value={mealId} onChange={event => setMealId(event.target.value)} required><option value="">Selecione uma refeição</option>{meals.filter(meal => String(meal.id) === mealId || meal.name.toLocaleLowerCase().includes(mealQuery.toLocaleLowerCase())).map(meal => <option key={meal.id} value={meal.id}>{meal.name}</option>)}</select></div>)}
          <button type="button" onClick={() => setInlineMeal(!inlineMeal)} className="rounded text-xs font-medium text-primary">{inlineMeal ? "Voltar à seleção" : "+ Criar nova refeição"}</button>
          {inlineMeal && <section className="space-y-3 rounded-card bg-surface-muted p-4"><p className="text-xs font-medium">Nova refeição</p><input aria-label="Nome da nova refeição" className={inputClass} value={newName} onChange={event => setNewName(event.target.value)} placeholder="Nome" maxLength={255} /><textarea aria-label="Descrição da nova refeição" className={inputClass} value={newDescription} onChange={event => setNewDescription(event.target.value)} placeholder="Descrição" /><button type="button" onClick={createInlineMeal} className={secondary}>Salvar e selecionar</button><p className="text-[10px] text-muted-foreground">A refeição permanece no catálogo mesmo se o planejamento for cancelado.</p></section>}
          {label("mealType", "Tipo de refeição", <select id={id+"mealType"} className={inputClass} value={type} onChange={event => setType(event.target.value as typeof type)}>{mealCategories.map(category => <option key={category.type} value={category.type}>{category.label}</option>)}</select>)}
          {kind === "edit-plan" && <p className="text-xs text-warning">A edição afeta toda a recorrência deste planejamento. A pessoa não pode ser alterada.</p>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={repeat} onChange={event => setRepeat(event.target.checked)} />Repetir em um período</label>
        </>}
        {kind === "clone" && <>{label("origin", "Período de origem", <select id={id+"origin"} className={inputClass} value={origin} onChange={event => setOrigin(event.target.value)} required><option value="">Selecione uma vigência cadastrada</option>{periods.map(period => <option key={period} value={period}>{period.split("|").map(date => formatDate(date)).join(" – ")}</option>)}</select>)}<p className="text-xs text-muted-foreground">{originPlans.length} planos na origem. A cópia mantém as refeições e os dias da semana; não altera os originais.</p></>}
        <div className="grid grid-cols-2 gap-3">
          {label("startDate", kind === "clone" ? "Início do destino" : "Data inicial", <input id={id+"startDate"} type="date" className={inputClass} value={start} onChange={event => setStart(event.target.value)} required />)}
          {(repeat || kind === "clone") && label("endDate", kind === "clone" ? "Fim do destino" : "Data final", <input id={id+"endDate"} type="date" className={inputClass} value={end} min={start} onChange={event => setEnd(event.target.value)} required />)}
        </div>
        {isPlan && repeat && <fieldset><legend className="mb-2 text-xs font-medium">Dias de repetição</legend><div className="mb-2 flex gap-2"><button type="button" className={secondary} onClick={() => setDays(dayValues.slice(0,5))}>Dias úteis</button><button type="button" className={secondary} onClick={() => setDays(dayValues.slice(5))}>Fim de semana</button><button type="button" className={secondary} onClick={() => setDays(dayValues)}>Todos</button></div><div className="flex flex-wrap gap-2">{dayValues.map((day,index) => <label key={day} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={days.includes(day)} onChange={event => setDays(current => event.target.checked ? [...current,day] : current.filter(value=>value!==day))} />{dayNames[index]}</label>)}</div></fieldset>}
        {isPlan && <PlanSummary mealName={meals.find(meal => String(meal.id) === mealId)?.name} mealType={type} people={users.filter(user => people.includes(String(user.id))).map(user => user.name)} days={finalDays} startDate={start} endDate={finalEnd} repeating={repeat} occurrences={occurrences} />}
        {kind === "clone" && withoutOccurrence > 0 && <p className="text-xs text-warning">{withoutOccurrence} plano(s) não terão ocorrências nos dias do destino. A cópia mantém os dias da semana originais.</p>}
        {kind === "clone" && originPlans.length > 0 && <ul className="max-h-36 space-y-1 overflow-y-auto rounded-control bg-surface-muted p-3">{originPlans.map(item => <li key={item.id} className="text-xs">{item.user.name} · {item.meal.name} · {item.targetDays.map(day=>dayNames[dayValues.indexOf(day)]).join(", ")}</li>)}</ul>}
      </>}
      {isDelete && <div className="space-y-3 rounded-card bg-danger-muted p-4 text-sm text-danger"><p className="font-semibold">Confirmar {kind === "reset" ? "restauração dos dados de demonstração" : "exclusão"}?</p><p>{kind === "delete-user" ? `Excluir ${request.user?.name} também remove todos os seus planos. As refeições permanecem.` : kind === "delete-meal" ? `Excluir ${request.meal?.name} também remove os planos que usam essa refeição.` : kind === "delete-plan" ? "Toda a recorrência deste plano será removida. A pessoa e a refeição permanecem." : "As criações e alterações de demonstração serão descartadas e as fixtures iniciais restauradas."}</p></div>}
    </fieldset>
    {successful.length > 0 && <p role="status" className="text-xs text-success">{successful.length} pessoa(s) já concluída(s). Não serão reenviadas.</p>}
    {Object.entries(errors).filter(([key]) => !["form", "message"].includes(key)).map(([key, text]) => <p key={key} className="text-xs text-danger">{text}</p>)}
    {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
    {uncertain && <Link href={`/?date=${start}`} onClick={onClose} className="block text-sm text-primary">Conferir calendário antes de repetir →</Link>}
    <footer className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" disabled={pending} onClick={onClose} className={secondary}>Cancelar</button><button type="submit" disabled={pending || loading || loadError || uncertain || inlineMeal} className={`rounded-control px-4 py-2 text-sm font-medium disabled:opacity-50 ${isDelete ? "bg-danger text-surface" : "bg-primary text-primary-foreground hover:bg-primary-hover"}`}>{pending ? "Salvando…" : successful.length ? "Tentar apenas pendentes" : isDelete ? "Confirmar" : "Salvar"}</button></footer>
  </form>;
}