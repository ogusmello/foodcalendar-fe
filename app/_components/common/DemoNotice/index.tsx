import { connection } from "next/server";
import { mockEnabled } from "@/lib/api/mocks";

export async function DemoNotice() {
  await connection();
  if (!mockEnabled()) return null;
  return <div role="status" className="border-b border-border bg-accent-muted px-4 py-2 text-center text-xs text-accent">Modo demonstração · dados fictícios. Configure a API para usar seus dados.</div>;
}
