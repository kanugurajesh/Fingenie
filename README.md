# FinGenie

An AI-powered personal finance assistant built with Next.js, Tambo AI, and Supabase. Track expenses, set budgets, and get spending insights through a conversational chat interface.

## What Can You Do?

Just type naturally in the chat. Here are some example prompts:

**Expense Tracking**
- "I spent $45 on groceries today"
- "Add a $15 coffee at Starbucks to the Food category"
- "Log an electricity bill of $120 to Utilities"

**Budget Management**
- "Set a budget of $500 for Food"
- "I want to limit Housing to $1200 a month"
- "Remove the budget for utilities"

**Spending Insights**
- "Analyze my spending"
- "What's my total spending this month?"
- "What's my top spending category?"

**Visualizations & Trends**
- "Show me my spending trends"
- "Show spending by category"
- "Display expenses from January to March"

**Budget Tracking**
- "Show me my budget overview"
- "How am I doing against my budgets?"

**Managing Transactions**
- "Show me all my transactions"
- "Show me Food category expenses"
- "Delete all food expenses"

## Tech Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tambo AI** for generative UI and AI chat
- **Supabase** (Auth + PostgreSQL) for authentication and data storage
- **Tailwind CSS 4** with dark mode support
- **Recharts** for data visualization
- **Zod** for schema validation

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Tambo](https://tambo.co/dashboard) API key (free)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/kanugurajesh/Fingenie
cd fingenie
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your keys:

```bash
cp example.env.local .env.local
```

Edit `.env.local` with your values:

```
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_TAMBO_API_KEY` | Your Tambo API key from [tambo.co/dashboard](https://tambo.co/dashboard) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key (Settings > API) |

### 3. Set up the database

The app requires three tables in Supabase: `profiles`, `expenses`, and `budgets`.

1. Open the **SQL Editor** in your [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it

This migration creates:

| Table | Purpose |
|---|---|
| `profiles` | User profiles, auto-created on signup via a database trigger |
| `expenses` | Individual expense records with date, amount, category, and description |
| `budgets` | Per-category budget limits (one budget per category per user) |

All tables have Row Level Security (RLS) enabled so users can only access their own data.

### 4. (Optional) Seed sample data

If you want to start with some test expenses:

1. **Sign up** in the app first (so your user account exists in Supabase Auth).
   If you signed up *before* running the migration, that's fine — the seed script will create your profile row automatically.
2. Find your user UUID by running this in the SQL Editor:
   ```sql
   SELECT id FROM auth.users WHERE email = 'your@email.com';
   ```
   Or find it in the Supabase Dashboard under **Authentication > Users**.
3. Open `scripts/seed.sql`, replace `YOUR_USER_UUID` with your actual UUID
4. Run the modified SQL in the Supabase SQL Editor

Alternatively, skip seeding and add expenses through the chat interface.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be directed to sign up or log in, then can start chatting with FinGenie to track expenses, set budgets, and view spending insights.

## Available Scripts

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run lint:fix  # Run ESLint with auto-fix
```

## Project Structure

```
src/
├── app/
│   ├── auth/                  # Login, signup, and OAuth callback routes
│   ├── chat/                  # Main chat interface
│   ├── interactables/         # Interactive finance components
│   ├── layout.tsx             # Root layout with TamboProvider + Supabase
│   ├── page.tsx               # Landing / home page
│   └── globals.css            # Global styles and CSS variables
├── components/
│   ├── tambo/                 # Chat UI components (messages, thread, input)
│   ├── ui/                    # Reusable UI primitives
│   ├── AuthButton.tsx         # Sign in / sign out button
│   ├── BudgetForm.tsx         # Budget creation form
│   ├── BudgetOverview.tsx     # Budget vs. spending display
│   ├── InsightCard.tsx        # Spending insight cards
│   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   └── TransactionList.tsx    # Expense list component
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   └── server.ts          # Server-side Supabase client
│   ├── tambo.ts               # Component & tool registration for Tambo AI
│   ├── thread-hooks.ts        # Custom thread management hooks
│   └── utils.ts               # Utility functions
├── services/
│   ├── transactions.ts        # Expense & budget Supabase queries
│   └── population-stats.ts    # Demo data service
├── middleware.ts               # Supabase auth session refresh
supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema (tables, RLS, triggers)
scripts/
└── seed.sql                    # Optional sample expense data
```

## Architecture

### High-Level Overview

```
┌─────────────┐     ┌──────────────────────────────────┐     ┌────────────────┐
│             │     │         Tambo AI Engine           │     │   Supabase     │
│   User      │────▶│                                  │────▶│                │
│   (Chat UI) │◀────│  ┌────────────┐  ┌────────────┐  │◀────│  PostgreSQL    │
│             │     │  │ Registered │  │ Registered │  │     │  + Auth        │
└─────────────┘     │  │ Components │  │   Tools    │  │     │  + RLS         │
                    │  └────────────┘  └────────────┘  │     └────────────────┘
                    └──────────────────────────────────┘

Flow:
  1. User sends a message in the chat UI
  2. Tambo AI interprets the message and decides which tools to call
  3. Tools execute queries against Supabase (read/write expenses, budgets)
  4. Tambo AI selects a registered component to render the results
  5. The component (Graph, TransactionList, InsightCard, etc.) appears in the chat
```

### Tambo AI Integration

**Component Registration** — UI components in `src/components/` are registered in `src/lib/tambo.ts` with Zod schemas defining their props. This lets the AI dynamically render them in the chat:

| Component | Purpose |
|---|---|
| `Graph` | Bar, line, and pie charts for spending trends (Recharts) |
| `BudgetForm` | Interactive form for creating/updating budgets |
| `InsightCard` | Single metric card with trend indicator |
| `TransactionList` | Tabular list of expenses |
| `BudgetOverview` | Progress bars comparing spending vs. budget per category |

**Tool System** — Service functions are registered as tools in `src/lib/tambo.ts` so the AI can invoke them to read and write data:

| Tool | Purpose |
|---|---|
| `addExpense` | Create a new expense record |
| `deleteExpense` | Remove an expense by ID |
| `getExpenses` | Retrieve expenses with optional category/date filters |
| `getSpendingInsights` | Analyze totals, averages, and category breakdown |
| `getSpendingTrends` | Return time-grouped data for chart rendering |
| `setBudget` | Set or update a per-category budget limit |
| `deleteBudget` | Remove a budget for a category |
| `getBudgetOverview` | Compare budgets vs. actual spending per category |

**Provider Pattern** — `TamboProvider` wraps the chat and interactables pages (`src/app/chat/page.tsx`, `src/app/interactables/page.tsx`), supplying the API key, registered components, tools, and context helpers to the component tree.

### Authentication Flow

1. **Supabase Auth** handles email/password sign-up and login
2. **Middleware** (`src/middleware.ts`) refreshes the auth session on every request and protects `/chat` and `/interactables` routes — unauthenticated users are redirected to `/auth/login`
3. Two Supabase clients are used:
   - `src/lib/supabase/client.ts` — browser-side client for client components
   - `src/lib/supabase/server.ts` — server-side client for server components and actions
4. **Row Level Security (RLS)** is enabled on all tables, ensuring users can only read, insert, update, and delete their own rows

### Database Schema

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id` (uuid, PK, FK → auth.users), `email`, `display_name`, `created_at` | Auto-created on signup via a database trigger |
| `expenses` | `id` (uuid, PK), `user_id` (FK → profiles), `date`, `description`, `amount`, `category` | Indexed on `user_id`, `(user_id, category)`, and `(user_id, date)` |
| `budgets` | `id` (uuid, PK), `user_id` (FK → profiles), `category`, `amount`, `created_at`, `updated_at` | Unique constraint on `(user_id, category)` — one budget per category per user |

### State Management

The app uses no global state library. State is managed through:

- **TamboProvider context** — thread state, streaming status, and component registry shared across the chat UI
- **Tambo hooks** — `useTamboThread` for message/thread management, `useTamboThreadInput` for input handling, `useTamboStreamStatus` for streaming state
- **Component-level `useState`** — local state within individual components (e.g., form inputs in `BudgetForm`)

## Deployment

### Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the three environment variables in the Vercel project settings
4. Deploy

### Supabase settings for production

In your Supabase Dashboard under **Authentication > URL Configuration**:

- Set **Site URL** to your production URL (e.g. `https://your-app.vercel.app`)
- Add your production URL to **Redirect URLs** (e.g. `https://your-app.vercel.app/auth/callback`)
