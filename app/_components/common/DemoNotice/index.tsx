import { connection } from "next/server";
import { mockEnabled } from "@/lib/api/mocks";

export async function DemoNotice() {
  await connection();
  if (!mockEnabled()) return null;
  return <p role="status" className="border-b border-border bg-accent-muted px-4 py-2 text-center text-xs text-accent">Modo demonstração · dados fictícios para visualizar a plataforma</p>;
}