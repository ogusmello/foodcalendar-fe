import type { User } from "@/lib/api/types";
export interface ProfileMenuProps {
  users: User[];
  selectedId: string | null;
}