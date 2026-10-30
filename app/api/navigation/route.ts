import { getNavigationData } from "@/lib/api/navigation";
import { parseDate } from "@/lib/calendar";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? "";
  const selected = params.get("userId");
  if (!parseDate(date) || (selected !== null && !/^[1-9]\d*$/.test(selected))) {
    return Response.json({ message: "Data ou pessoa inválida." }, { status: 400 });
  }
  try {
    const data = await getNavigationData(date, selected, request.signal);
    return data ? Response.json(data) : Response.json({ message: "Pessoa não encontrada." }, { status: 404 });
  } catch {
    return Response.json({ message: "Não foi possível consultar o planejamento agora." }, { status: 503 });
  }
}