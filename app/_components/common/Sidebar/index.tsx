"use client";
import { motion } from "framer-motion";

import { BrandMark } from "../BrandMark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { CalendarBlankIcon, ForkKnifeIcon, GearIcon, ListIcon, SidebarIcon, XIcon } from "@phosphor-icons/react";
import { NavItem } from "./parts/NavItem";
import type { SidebarItem } from "./types";

const mainItems: SidebarItem[] = [
  { href: "/", label: "Calendário", icon: CalendarBlankIcon },
  { href: "/refeicoes", label: "Refeições", icon: ForkKnifeIcon },
];
const settingsItem: SidebarItem = {
  href: "/configuracoes", label: "Configurações", icon: GearIcon,
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggle = useRef<HTMLButtonElement>(null);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <motion.aside layout initial={false} className={`flex shrink-0 flex-col border-b border-border bg-surface md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0 ${collapsed ? "md:w-20" : "md:w-sidebar"}`}>
      <header className={`flex min-h-topbar items-center gap-2 px-4 ${collapsed ? "md:flex-col md:justify-center md:gap-3 md:py-4" : "justify-between"}`}>
        <Link href="/" aria-label="À Mesa — Calendário" onNavigate={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-control">
          <BrandMark className="h-6 w-6 shrink-0 text-foreground" />
          <span className={`font-brand text-lg font-semibold ${collapsed ? "md:hidden" : ""}`}>À Mesa</span>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-expanded={!collapsed}
          aria-controls="sidebar-navigation"
          className="hidden size-9 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted hover:text-foreground md:flex"
        >
          <SidebarIcon size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          ref={mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          aria-controls="sidebar-navigation"
          className="ml-auto flex size-10 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted md:hidden"
        >
          {mobileOpen ? <XIcon size={20} aria-hidden="true" /> : <ListIcon size={20} aria-hidden="true" />}
        </button>
      </header>
      <nav
        id="sidebar-navigation"
        aria-label="Navegação principal"
        onKeyDown={(event) => {
          if (event.key === "Escape" && mobileOpen) {
            setMobileOpen(false);
            mobileToggle.current?.focus();
          }
        }}
        className={`${mobileOpen ? "flex" : "hidden"} flex-1 flex-col gap-1 p-3 md:flex`}
      >
        {mainItems.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        ))}
        <div className="mt-3 border-t border-border pt-3 md:mt-auto">
          <NavItem item={settingsItem} active={isActive(settingsItem.href)} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        </div>
      </nav>
    </motion.aside>
  );
}
