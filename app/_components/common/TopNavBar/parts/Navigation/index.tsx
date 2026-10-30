"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { localDate, parseDate } from "@/lib/calendar";
import type { NavigationData } from "@/lib/api/types";
import { ThemeSwitcher } from "../../../ThemeSwitcher";
import { Search } from "../Search";
import { DayOverview } from "../DayOverview";
import { ProfileMenu } from "../ProfileMenu";

export function Navigation() {
  const params = useSearchParams();
  const requestedDate = params.get("date");
  const userId = params.get("userId");
  const [revision, setRevision] = useState(0);
  const [today, setToday] = useState("");
  const [result, setResult] = useState<{ key: string; data: NavigationData } | null>(null);
  const date = requestedDate && parseDate(requestedDate) ? requestedDate : today;
  const key = `${date}:${userId ?? ""}`;

  useEffect(() => {
    function updateDate() { setToday(localDate()); }
    const timer = window.setInterval(updateDate, 60_000);
    const initial = window.setTimeout(updateDate, 0);
    return () => { window.clearInterval(timer); window.clearTimeout(initial); };
  }, []);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ date });
    if (userId) query.set("userId", userId);
    fetch(`/api/navigation?${query}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Navigation unavailable");
        return response.json() as Promise<NavigationData>;
      })
      .then((data) => setResult({ key, data }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, data: { users: [], plans: [], status: "unavailable" } });
      });
    return () => controller.abort();
  }, [date, userId, key, revision]);

  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener("foodist:meals-updated", refresh);
    return () => window.removeEventListener("foodist:meals-updated", refresh);
  }, []);

  const data = result?.key === key ? result.data : null;

  return (
    <header className="grid grid-cols-[auto_1fr] items-center gap-x-8 gap-y-3 border-b border-border bg-surface px-4 py-3 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="shrink-0">
        <Search date={date} userId={userId} />
      </div>
      <div className="order-last col-span-2 min-w-0 md:order-none md:col-span-1">
        <DayOverview date={date} data={data} userId={userId} />
      </div>
      <div className="flex shrink-0 items-center justify-self-end gap-2">
        <ThemeSwitcher variant="icon" />
        <ProfileMenu users={data?.users ?? []} selectedId={userId} />
      </div>
    </header>
  );
}