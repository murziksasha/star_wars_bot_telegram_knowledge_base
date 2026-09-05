import { config as loadDotenv } from "dotenv";

loadDotenv();

const swapiBaseUrl = (process.env.SWAPI_BASE_URL ?? "https://swapi.online").replace(/\/$/, "");
const timeoutMs = 8000;

const checks: Array<{ name: string; path: string; assert: (data: unknown) => void }> = [
  {
    name: "films list",
    path: "/api/films",
    assert: (data) => {
      if (!Array.isArray(data) || data.length === 0) throw new Error("expected films array");
    },
  },
  {
    name: "character 1",
    path: "/api/characters/1",
    assert: (data) => {
      const row = data as { name?: string };
      if (row.name !== "Luke Skywalker") throw new Error("expected Luke Skywalker");
    },
  },
  {
    name: "people search Luke",
    path: "/api/people?search=Luke",
    assert: (data) => {
      if (!Array.isArray(data) || data.length === 0) throw new Error("expected search hits");
    },
  },
  {
    name: "planets 1",
    path: "/api/planets/1",
    assert: (data) => {
      const row = data as { name?: string };
      if (row.name !== "Tatooine") throw new Error("expected Tatooine");
    },
  },
  {
    name: "starship 2",
    path: "/api/starships/2",
    assert: (data) => {
      const row = data as { starship_class?: string };
      if (!row.starship_class) throw new Error("expected starship_class");
    },
  },
  {
    name: "transport 2",
    path: "/api/transports/2",
    assert: (data) => {
      const row = data as { name?: string };
      if (row.name !== "CR90 corvette") throw new Error("expected CR90 corvette");
    },
  },
  {
    name: "film 1 characters",
    path: "/api/films/1/characters",
    assert: (data) => {
      if (!Array.isArray(data) || data.length === 0) throw new Error("expected film characters");
    },
  },
];

let failed = 0;
for (const check of checks) {
  const url = `${swapiBaseUrl}${check.path}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    check.assert(data);
    console.log(`ok  ${check.name}`);
  } catch (error) {
    failed += 1;
    console.error(`fail ${check.name}:`, error instanceof Error ? error.message : error);
  }
}

if (failed > 0) {
  process.exitCode = 1;
}
