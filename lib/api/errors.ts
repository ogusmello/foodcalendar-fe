export class ApiMutationError extends Error {
  constructor(public status: number, public body: Record<string, unknown>) {
    super(typeof body.message === "string" ? body.message : "Não foi possível concluir a operação.");
  }
}