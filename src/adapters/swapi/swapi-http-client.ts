import { NotFoundError } from "../../domain/errors/not-found-error.ts";
import { UpstreamError } from "../../domain/errors/upstream-error.ts";

export class SwapiHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
  ) {}

  async getJson<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new UpstreamError(`SWAPI request failed: ${path}`, undefined, error);
    }

    if (response.status === 404) {
      const match = path.match(/\/api\/([^/]+)\/(\d+)/);
      throw new NotFoundError(match?.[1] ?? "resource", Number(match?.[2] ?? 0));
    }

    if (!response.ok) {
      throw new UpstreamError(`SWAPI HTTP ${response.status} for ${path}`, response.status);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new UpstreamError(`SWAPI returned invalid JSON for ${path}`, response.status, error);
    }
  }
}
