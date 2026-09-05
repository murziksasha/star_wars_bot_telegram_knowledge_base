export class UpstreamError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message, { cause });
    this.name = "UpstreamError";
    this.status = status;
  }
}
