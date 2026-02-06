import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between px-6 py-4">
        <h2 className="text-lg font-bold text-foreground">FinGenie</h2>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl font-bold text-foreground tracking-tight">
          Your AI Finance Assistant
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-md">
          Track expenses, set budgets, and get spending insights — all through a conversational AI interface.
        </p>

        <div className="flex gap-4 mt-8">
          <a
            href="/auth/login"
            className="px-6 py-3 rounded-md font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/auth/signup"
            className="px-6 py-3 rounded-md font-medium border border-border text-foreground hover:bg-accent transition-colors"
          >
            Create Account
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-2xl w-full">
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-card-foreground">Track Expenses</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add and categorize expenses with simple chat commands.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-card-foreground">Set Budgets</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Define spending limits per category and track progress.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-card-foreground">Get Insights</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize trends and understand your spending patterns.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
