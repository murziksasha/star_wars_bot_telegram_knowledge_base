# C4 diagrams

Визуальные диаграммы по [C4 model](https://c4model.com): C4-PlantUML (stdlib PlantUML) → **PNG** (GitHub) и SVG.

GitHub не рисует PlantUML и неофициальный mermaid `C4Context`. Картинки в [`ARCHITECTURE.md`](../ARCHITECTURE.md) — PNG, поэтому они видны на странице файла.

| PNG (GitHub) | Уровень |
|---|---|
| [01-context.png](01-context.png) | System Context |
| [02-containers.png](02-containers.png) | Containers |
| [03-components-overview.png](03-components-overview.png) | Components (слои app) |
| [03-infrastructure.png](03-infrastructure.png) | Components — Infrastructure |
| [03-telegram.png](03-telegram.png) | Components — Telegram inbound |
| [03-i18n.png](03-i18n.png) | Components — i18n |
| [03-application.png](03-application.png) | Components — Application |
| [03-domain.png](03-domain.png) | Components — Domain |
| [03-outbound.png](03-outbound.png) | Components — Outbound adapters |
| [03-webhook-cli.png](03-webhook-cli.png) | Components — Webhook CLI |
| [04-deployment.png](04-deployment.png) | Deployment (supporting) |

Исходники — рядом, `*.puml`. Векторные копии — `*.svg`. Пересобрать:

```bash
npm run c4:render
```

Нужен доступ к [Kroki](https://kroki.io) (`KROKI_URL` по умолчанию `https://kroki.io`).
