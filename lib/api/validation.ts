import { parseDate } from "../calendar";
import { ApiMutationError } from "./errors";

export const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
export const mealTypes = ["BREAKFAST", "LUNCH", "SNACK", "DINNER", "DESSERT"];

export function validateInput(resource: string, method: string, input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApiMutationError(400, { message: "Dados inválidos." });
  const source = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const partial = method === "PATCH";
  function field(key: string, type: "text" | "id" | "date" | "type" | "days", required = true) {
    const value = source[key];
    if ((value === undefined || value === null) && (partial || !required)) return;
    let valid = false;
    if (type === "text") valid = typeof value === "string" && !!value.trim() && (key !== "name" || value.length <= 255);
    if (type === "id") valid = typeof value === "number" && Number.isSafeInteger(value) && value > 0;
    if (type === "date") valid = typeof value === "string" && !!parseDate(value);
    if (type === "type") valid = typeof value === "string" && mealTypes.includes(value);
    if (type === "days") valid = Array.isArray(value) && value.length > 0 && value.every(day => typeof day === "string" && weekdays.includes(day));
    if (!valid) errors[key] = key === "name" ? "Informe um nome com até 255 caracteres." : "Informe um valor válido.";
    else result[key] = type === "days" ? [...new Set(value as string[])] : value;
  }
  if (resource === "users") field("name", "text");
  else if (resource === "meals") { field("name", "text"); field("description", "text"); }
  else if (resource === "meal-plans") {
    if (!partial) field("userId", "id");
    field("mealId", "id"); field("mealType", "type");
    field("startDate", "date"); field("endDate", "date"); field("targetDays", "days");
  } else if (resource === "clone") {
    field("userId", "id");
    for (const key of ["originalStartDate", "originalEndDate", "newStartDate", "newEndDate"]) field(key, "date");
  } else throw new ApiMutationError(404, { message: "Operação não encontrada." });
  for (const [start, end] of resource === "clone" ? [["originalStartDate", "originalEndDate"], ["newStartDate", "newEndDate"]] : [["startDate", "endDate"]]) {
    if (typeof result[start] === "string" && typeof result[end] === "string" && result[start] > result[end]) errors[end] = "O fim deve ser igual ou posterior ao início.";
  }
  if (Object.keys(errors).length) throw new ApiMutationError(400, errors);
  return result;
}