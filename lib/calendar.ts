export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const result = new Date(year, month - 1, day, 12);
  return localDate(result) === value ? result : null;
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }): string {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("pt-BR", options).format(date) : value;
}
export function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getMonthDays(value: string): string[] {
  const date = parseDate(value);
  if (!date) throw new Error("Invalid calendar date");
  const first = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  first.setDate(first.getDate() - (first.getDay() + 6) % 7);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
  last.setDate(last.getDate() + (7 - last.getDay()) % 7);
  const days: string[] = [];
  const cursor = new Date(first);
  while (cursor <= last) {
    days.push(localDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function shiftMonth(value: string, offset: number): string {
  const date = parseDate(value);
  if (!date) throw new Error("Invalid calendar date");
  return localDate(new Date(date.getFullYear(), date.getMonth() + offset, 1, 12));
}

export function shiftDays(value: string, offset: number): string {
  const date = parseDate(value);
  if (!date) throw new Error("Invalid calendar date");
  date.setDate(date.getDate() + offset);
  return localDate(date);
}

export function getWeekDays(value: string): string[] {
  const date = parseDate(value);
  if (!date) throw new Error("Invalid calendar date");
  const monday = shiftDays(value, -((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => shiftDays(monday, index));
}
