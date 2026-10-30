"use client";

import { useEffect, useState } from "react";
import type { Meal } from "@/lib/api/types";
import type { MealPickerProps } from "./types";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export function MealPicker({ id, meals, value, onChange }: MealPickerProps) {
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const selected = meals.find(meal => String(meal.id) === value);
  const options = meals.filter(meal => normalize(meal.name).includes(normalize(query ?? "")));
  const activeMeal = options[active];

  useEffect(() => {
    if (open && activeMeal) document.getElementById(id + "-option-" + activeMeal.id)?.scrollIntoView({ block: "nearest" });
  }, [open, activeMeal, id]);

  function choose(meal: Meal) {
    onChange(String(meal.id));
    setQuery(null);
    setOpen(false);
    setActive(-1);
  }

  return <div className="relative" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
      setActive(-1);
    }
  }}>
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open}
      aria-controls={id + "-options"} aria-activedescendant={open && activeMeal ? id + "-option-" + activeMeal.id : undefined}
      aria-required="true" autoComplete="off" placeholder="Busque e selecione uma refeição"
      value={query ?? selected?.name ?? ""}
      className="w-full rounded-control border border-border bg-background px-3 py-2.5 text-sm"
      onFocus={() => setOpen(true)}
      onChange={event => { setQuery(event.target.value); onChange(""); setOpen(true); setActive(-1); }}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
          setActive(current => options.length ? event.key === "ArrowDown" ? (current + 1) % options.length : (current <= 0 ? options.length : current) - 1 : -1);
        } else if (event.key === "Enter" && open) {
          event.preventDefault();
          if (activeMeal) choose(activeMeal);
        } else if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          setActive(-1);
        }
      }} />
    {open && <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-control border border-border bg-surface shadow-popover">
      <ul id={id + "-options"} role="listbox" aria-label="Refeições disponíveis" className="max-h-52 overflow-y-auto p-1">
        {options.map((meal, index) => <li key={meal.id} id={id + "-option-" + meal.id} role="option"
          aria-selected={String(meal.id) === value}
          onMouseDown={event => event.preventDefault()}
          onClick={() => choose(meal)}
          className={`cursor-pointer rounded-control px-3 py-2.5 text-sm ${index === active || String(meal.id) === value ? "bg-primary-muted text-primary-muted-foreground" : "hover:bg-surface-muted"}`}>
          {meal.name}
        </li>)}
      </ul>
      {options.length === 0 && <p role="status" className="px-4 py-3 text-sm text-muted-foreground">Nenhuma refeição encontrada. Você pode criar uma abaixo.</p>}
    </div>}
  </div>;
}
