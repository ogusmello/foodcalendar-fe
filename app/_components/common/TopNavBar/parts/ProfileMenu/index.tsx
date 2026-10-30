"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GearIcon, UserCircleIcon, UsersIcon } from "@phosphor-icons/react";
import type { ProfileMenuProps } from "./types";

export function ProfileMenu({ users, selectedId }: ProfileMenuProps) {
  const params = useSearchParams();
  const selected = users.find((user) => String(user.id) === selectedId);
  const label = selected?.name ?? (selectedId ? "Perfil" : "Ambos");

  function href(id?: number) {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("userId", String(id)); else next.delete("userId");
    return `/?${next}`;
  }

  return (
    <details className="group relative">
      <summary aria-label={`Perfil: ${label}`} className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary-muted text-primary-muted-foreground"><UserCircleIcon size={23} aria-hidden="true" /></span>
        <span className="max-w-24 truncate text-sm font-medium">{label}</span>
      </summary>
      <div className="absolute right-0 z-30 mt-3 w-60 rounded-card border border-border bg-surface p-2 shadow-popover" onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open");
      }} onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.currentTarget.closest("details")?.removeAttribute("open");
          event.currentTarget.parentElement?.querySelector("summary")?.focus();
        }
      }}>
        <p className="px-3 py-2 text-xs text-muted-foreground">Visualizar planejamento</p>
        <Link href={href()} aria-current={!selectedId ? "true" : undefined} className="flex items-center gap-2 rounded-control px-3 py-2 text-sm hover:bg-surface-muted"><UsersIcon size={18} aria-hidden="true" />Ambos</Link>
        {users.map((user) => <Link key={user.id} href={href(user.id)} aria-current={String(user.id) === selectedId ? "true" : undefined} className="flex items-center gap-2 rounded-control px-3 py-2 text-sm hover:bg-surface-muted"><UserCircleIcon size={18} aria-hidden="true" />{user.name}</Link>)}
        <div className="my-2 border-t border-border" />
        <Link href="/configuracoes" className="flex items-center gap-2 rounded-control px-3 py-2 text-sm hover:bg-surface-muted"><GearIcon size={18} aria-hidden="true" />Configurações</Link>
      </div>
    </details>
  );
}