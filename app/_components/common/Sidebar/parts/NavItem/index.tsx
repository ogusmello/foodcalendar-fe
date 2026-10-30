import Link from "next/link";
import type { NavItemProps } from "./types";

export function NavItem({ item, active, collapsed, onNavigate }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      onNavigate={onNavigate}
      className={`flex min-h-11 items-center gap-3 rounded-control px-3 py-2 text-sm font-medium ${
        active
          ? "bg-primary-muted text-primary-muted-foreground"
          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
      } ${collapsed ? "md:justify-center" : ""}`}
    >
      <Icon size={20} weight={active ? "fill" : "regular"} aria-hidden="true" className="shrink-0" />
      <span className={collapsed ? "md:sr-only" : ""}>{item.label}</span>
    </Link>
  );
}
