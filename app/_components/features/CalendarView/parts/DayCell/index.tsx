import Link from "next/link";
import { formatDate } from "@/lib/calendar";
import { mealCategories } from "@/lib/meals";
import type { DayCellProps } from "./types";

export function DayCell({ date, today, selected, inMonth, plans, href, incomplete }: DayCellProps) {
  const label = formatDate(date, { weekday: "long", day: "numeric", month: "long" });
  return <td className={`h-36 border-r border-b border-border p-1.5 align-top last:border-r-0 ${selected ? "bg-primary-muted/30" : inMonth ? "bg-surface" : "bg-background"}`}>
    <Link href={href} aria-label={`${label}${date === today ? ", hoje" : ""}, ${plans.length} refeições`} aria-current={selected ? "date" : undefined} className="group block rounded-control">
      <span className={`mb-1.5 flex size-7 items-center justify-center rounded-full text-xs ${date === today ? "bg-primary font-semibold text-primary-foreground" : selected ? "bg-primary-muted font-semibold text-primary-muted-foreground" : inMonth ? "text-foreground" : "text-muted-foreground"}`}>{Number(date.slice(-2))}</span>
      <span className="space-y-1">
        {plans.slice(0, 3).map(plan => {
          const category = mealCategories.find(item => item.type === plan.mealType);
          return <span key={plan.id} title={`${category?.label ?? plan.mealType} · ${plan.meal.name} · ${plan.user.name}`} className={`block truncate rounded px-1.5 py-1 text-[10px] leading-3 group-hover:underline ${category?.color ?? "bg-surface-muted text-foreground"}`}>{plan.meal.name}</span>;
        })}
        {plans.length > 3 && <span className="block px-1 text-[10px] font-medium text-muted-foreground">+{plans.length - 3} refeições</span>}
        {plans.length === 0 && <span className="block px-1 text-[10px] text-muted-foreground">{incomplete ? "Dados incompletos" : "Sem refeições"}</span>}
      </span>
    </Link>
  </td>;
}