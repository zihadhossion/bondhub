# BondHub

A full-stack social platform monorepo powered by [Turborepo](https://turbo.build).

## Apps

| App | Path | Description |
|-----|------|-------------|
| `@bondhub/api` | `apps/api` | NestJS REST API (port 5001) |
| `@bondhub/web` | `apps/web` | React user-facing frontend (port 5173) |
| `@bondhub/admin` | `apps/admin` | React admin dashboard (port 5174) |

## Getting Started

### Install dependencies

```bash
npm install
```

### Run all apps in development

```bash
npm run dev
```

### Build all apps

```bash
npm run build
```

### Lint all apps

```bash
npm run lint
```

### Run unit tests

```bash
npm run test
```

## Tech Stack

- **Backend:** NestJS 11, TypeORM, PostgreSQL, Prisma (migrations)
- **Frontend:** React 19, Vite 8, Redux Toolkit, Tailwind CSS 4
- **Monorepo tooling:** Turborepo 2, npm workspaces
