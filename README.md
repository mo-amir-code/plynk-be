# Moku Core 🚀

High-performance, domain-driven Express API for the Creator Page Builder platform.

## Quick Start

### 1. Initialize Repository
Clone the repository and enter the project directory:
```bash
git clone git@github.com:mo-amir-code/moku-be.git
cd moku-be
```

### 2. Install Dependencies & Environment
Install the required packages and set up your environment variables:
```bash
pnpm install
cp .env.example .env
```

### 3. Database Initialization
Synchronize your database schema and generate the Prisma client:
```bash
pnpm prisma:migrate
pnpm prisma:generate
```

### 4. Boot Development Server
Start the API with hot-reload enabled:
```bash
pnpm dev
```

---

## Architecture & Design

This project follows a **Modular Domain Pattern**. Each core business entity is encapsulated within its own module in `src/modules/`, ensuring high cohesion and low coupling.

### Project Structure
```text
src/
├── modules/          # Business logic (Routes ⟶ Controllers ⟶ Services)
│   ├── auth/         # JWT-based identity management
│   ├── page/         # Creator landing page orchestration
│   └── widget/       # Dynamic widget system
├── common/           # Shared infrastructure
│   ├── middleware/   # Request interception (Logging, Auth, Validation)
│   ├── utils/        # Standardized API response wrappers
│   └── enums/        # System-wide constants (HTTP Status, etc.)
├── config/           # Infrastructure singletons (Prisma, etc.)
├── app.ts            # Application & Middleware injection
└── server.ts         # Process entry & lifecycle management
```

---

## Internal Workflow

### 1. Request Lifecycle
Every API request follows a strict pipeline before execution:
`Logger` ⟶ `Parser` ⟶ `Zod Validation` ⟶ `Controller` ⟶ `Global Error Handler`

### 2. Type-Safe Development
- **Validation**: Strict schema-first validation using `Zod`.
- **Database**: Type-safe queries with `Prisma ORM`.
- **Environment**: Runtime validation of `.env` variables.

---

## Testing Suite 🛡️

The project uses **Vitest** for high-performance functional logic testing. The suite is fully isolated from your production/development database using a dedicated Docker container.

### 1. Prerequisites
- **Docker Desktop**: Ensure Docker is running on your machine.

### 2. Prepare Test Environment
Start the isolated test database (running on Port 5433):
```bash
pnpm test:db:up
```

### 3. Run Tests
Execute the full test suite:
```bash
pnpm test
```
Or use the interactive UI:
```bash
pnpm test:ui
```

### 4. Safety Guarantee
The testing suite is programmatically locked to **Port 5433**. It forcefully ignores your root `.env` and `DIRECT_URL` configs using `PRISMA_NO_DOTENV` to ensure your production data (Supabase) is **never** touched during a test run.

---

## Available Commands

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Start development server (Hot-reload) |
| `pnpm test:db:up` | Launch isolated test database (Docker) |
| `pnpm test` | Run full test suite |
| `pnpm test:ui` | Open Vitest interactive UI |
| `pnpm prisma:studio` | Open interactive Database GUI |
| `pnpm build` | Compile TypeScript into `/dist` |
| `pnpm format` | Auto-format codebase (Prettier) |
| `pnpm lint` | Run static analysis (ESLint) |

---

## Contribution Guide

1. **Format Check**: Always run `pnpm format` before pushing.
2. **Schema Changes**: Modify `prisma/schema.prisma` then run `pnpm prisma:migrate`.
3. **Environment**: If adding new vars, update `.env.example`.

---

## License
MIT
