import { getApi } from "@/lib/api/server";
import type { User } from "@/lib/api/types";

export async function People() {
  let users: User[];
  try { users = await getApi<User[]>("/users"); }
  catch { return <p className="mt-3 text-sm text-muted-foreground">Pessoas indisponíveis no momento.</p>; }
  return <ul className="mt-4 grid gap-3 sm:grid-cols-2">{users.map(user => <li key={user.id} className="flex items-center gap-3 rounded-control bg-surface-muted p-3"><span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-primary-muted text-sm font-medium text-primary-muted-foreground">{user.name.slice(0, 1)}</span><span><span className="block text-sm font-medium">{user.name}</span><span className="text-xs text-muted-foreground">Perfil do planejamento</span></span></li>)}</ul>;
}