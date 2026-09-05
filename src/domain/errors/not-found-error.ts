export class NotFoundError extends Error {
  readonly kind: string;
  readonly id: number;

  constructor(kind: string, id: number) {
    super(`${kind} ${id} not found`);
    this.name = "NotFoundError";
    this.kind = kind;
    this.id = id;
  }
}
