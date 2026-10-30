import type { SidebarItem } from "../../types";

export interface NavItemProps {
  item: SidebarItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}
