# Dong

**Good company. Better expenses.**

Dong is a group expense management and splitting app. Create a group for a trip, an apartment, or any get-together, invite people with a link, log shared expenses, and let Dong work out who owes whom, using as few payments as possible.

**[Live demo](https://dong-sgyf.onrender.com/)**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Groups** — create groups for trips, households, events, or anything else, and share them through an invite link.
- **Flexible expense splitting** — record who paid and who shares the cost, split by:
  - **Equal** — divided evenly among participants
  - **Percentage** — each participant owes a defined percentage
  - **Exact amount** — specify each participant's amount manually
- **Balance calculation** — see at a glance who is owed money (creditor) and who owes money (debtor).
- **Debt simplification** — many cross-payments are reduced to a minimal set of settlements (e.g. `Sara → Roxana $40`).
- **Settlements** — mark settlements as paid, and undo if needed.
- **Group dashboard** — total spending, per-person share, spending by category, and recent activity.
- **Activity history** — a log of expenses, member changes, and payments.
- **Dark mode** — light and dark themes built on design tokens.
- **Responsive UI** — sidebar navigation on desktop and a compact bottom navigation on mobile.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router), TypeScript (strict) |
| Database | PostgreSQL on [Neon](https://neon.tech/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Authentication | [Better Auth](https://www.better-auth.com/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) (Radix UI), [lucide-react](https://lucide.dev/) |
| Forms & validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Charts | shadcn charts ([Recharts](https://recharts.org/)) |
| Testing | [Vitest](https://vitest.dev/) |
| Hosting | [Render](https://render.com/) |

## How It Works

The interesting part of Dong happens *after* expenses are logged.

### Money handling

All amounts are stored and computed as **integers in minor units** (e.g. cents). Floating-point numbers are never used for money, and values are formatted only at the UI edge with `Intl.NumberFormat`.

### Splitting

Every expense is resolved into per-member shares that **always sum exactly to the expense total**:

- **Equal:** the total is divided by the number of participants, and any remainder is distributed deterministically (the first *N* members in a stable order receive one extra minor unit).
- **Percentage:** percentages must total 100 and are resolved using the largest-remainder method.
- **Exact:** the amounts must add up to the total, otherwise validation fails.

### Balances

For each member:

```
balance = total paid − total owed (sum of shares), adjusted by settlements already paid
```

A positive balance means the member is owed money; a negative balance means they owe money. The balances in a group always sum to zero.

### Settlement simplification

Dong uses a deterministic greedy algorithm: repeatedly match the largest debtor with the largest creditor and transfer `min(|debt|, credit)` until everyone is settled. This produces a small number of transfers instead of a tangle of cross-payments.

```
Before:  A → B $10,  B → C $10,  C → A $5,  ...
After:   A → C $5
```

This logic lives in pure functions (`splits`, `balances`, `settlements`) with no database or React dependencies, so it is fully unit-tested.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A PostgreSQL database (a free [Neon](https://neon.tech/) project works well)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/roxana-hgh/Dong.git
cd dong

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then fill in the values (see below)

# 4. Apply database migrations and generate the Prisma client
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` file in the project root:

```env
# Neon pooled connection string (used by the app)
DATABASE_URL=

# Neon direct connection string (used by Prisma migrations)
DIRECT_URL=

# Authentication
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Public app URL (used for invite links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Neon provides two connection strings. Use the **pooled** one for `DATABASE_URL` so serverless functions don't exhaust database connections, and the **direct** one for `DIRECT_URL` because migrations require a direct connection.

Never commit `.env*` files. Keep `.env.example` up to date when adding variables.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests with Vitest |
| `npx prisma migrate dev` | Create and apply a migration in development |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

## Project Structure

```
app/
  (auth)/               # Login and register
  (main)/               # Authenticated shell: sidebar, header, mobile nav
    groups/[groupId]/   # Overview, expenses, members, settlement, activity
  join/[token]/         # Invite link landing page
components/             # UI building blocks (shadcn primitives in components/ui)
lib/                    # Prisma client, auth, and pure business logic
  money.ts              # Minor-unit helpers and formatting
  splits.ts             # Equal / percentage / exact split logic
  balances.ts           # Balance computation
  settlements.ts        # Debt simplification
validators/             # Shared Zod schemas
actions/                # Server Actions grouped by domain
prisma/
  schema.prisma
  migrations/
```

## Testing

The core business logic is covered by unit tests, including edge cases such as everyone already settled, a single creditor, many small debts, and rounding leftovers.

```bash
npm run test
```

## Roadmap

- [x] Foundation: Next.js, Tailwind, shadcn/ui, Prisma, Neon, authentication
- [x] Groups, members, and invite links
- [x] Expenses with equal, percentage, and exact splits
- [x] Balances, settlement simplification, and mark-as-paid
- [x] Group dashboard, category chart, and activity feed
- [x] Guest mode (use the app without an account)
- [x] Friends list and reusable friend groups
- [ ] Multi-currency support
- [ ] Receipt uploads
- [ ] Notifications
- [ ] Recurring expenses
- [ ] CSV export

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feat/your-feature`
5. Open a pull request

When changing balance, split, or settlement logic, please include unit tests in the same pull request.
