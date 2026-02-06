// src/services/transactions.ts

import { z } from "zod";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// --- Helper: get the current user's ID ---

async function requireUserId(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user.id;
}

// --- addExpense ---

export const addExpenseSchema = z.object({
  description: z.string().describe("Description of the expense"),
  amount: z.number().describe("Amount of the expense"),
  category: z.string().describe("Category of the expense (e.g., 'Food', 'Utilities', 'Housing')"),
});

export type AddExpenseInput = z.infer<typeof addExpenseSchema>;

export async function addExpense(input: AddExpenseInput): Promise<{ success: boolean; message: string }> {
  const userId = await requireUserId();
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    date: new Date().toISOString().split("T")[0],
    description: input.description,
    amount: input.amount,
    category: input.category,
  });

  if (error) {
    return { success: false, message: `Failed to add expense: ${error.message}` };
  }

  return { success: true, message: `Expense '${input.description}' of $${input.amount} added to ${input.category}.` };
}

// --- getExpenses ---

export const getExpensesSchema = z.object({
  category: z.string().optional().describe("Filter expenses by category"),
  startDate: z.string().optional().describe("Filter expenses from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter expenses up to this date (YYYY-MM-DD)"),
});

export type GetExpensesInput = z.infer<typeof getExpensesSchema>;

export async function getExpenses(input: GetExpensesInput): Promise<Array<{ id: string; date: string; description: string; amount: number; category: string }>> {
  const supabase = getSupabaseBrowserClient();

  let query = supabase.from("expenses").select("id, date, description, amount, category").order("date", { ascending: false });

  if (input.category) {
    query = query.ilike("category", input.category);
  }
  if (input.startDate) {
    query = query.gte("date", input.startDate);
  }
  if (input.endDate) {
    query = query.lte("date", input.endDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);

  return (data ?? []).map((row: { id: string; date: string; description: string; amount: number; category: string }) => ({
    id: row.id,
    date: row.date,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
  }));
}

// --- getSpendingInsights ---

export const getSpendingInsightsSchema = z.object({
  category: z.string().optional().describe("Filter insights by category"),
  startDate: z.string().optional().describe("Filter from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter up to this date (YYYY-MM-DD)"),
});

export const spendingInsightsOutputSchema = z.object({
  totalSpending: z.number(),
  averageTransaction: z.number(),
  transactionCount: z.number(),
  topCategory: z.string(),
  topCategoryAmount: z.number(),
  categoryBreakdown: z.array(
    z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
      count: z.number(),
    })
  ),
});

export type GetSpendingInsightsInput = z.infer<typeof getSpendingInsightsSchema>;

export async function getSpendingInsights(input: GetSpendingInsightsInput) {
  const expenses = await getExpenses(input);

  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const transactionCount = expenses.length;
  const averageTransaction = transactionCount > 0 ? Math.round((totalSpending / transactionCount) * 100) / 100 : 0;

  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const exp of expenses) {
    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = { amount: 0, count: 0 };
    }
    categoryMap[exp.category].amount += exp.amount;
    categoryMap[exp.category].count += 1;
  }

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      amount: Math.round(data.amount * 100) / 100,
      percentage: totalSpending > 0 ? Math.round((data.amount / totalSpending) * 10000) / 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown[0]?.category ?? "N/A";
  const topCategoryAmount = categoryBreakdown[0]?.amount ?? 0;

  return {
    totalSpending: Math.round(totalSpending * 100) / 100,
    averageTransaction,
    transactionCount,
    topCategory,
    topCategoryAmount,
    categoryBreakdown,
  };
}

// --- getSpendingTrends ---

export const getSpendingTrendsSchema = z.object({
  groupBy: z.enum(["day", "week", "month"]).optional().describe("How to group the spending data (default: month)"),
  category: z.string().optional().describe("Filter trends by category"),
});

export const spendingTrendsOutputSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(
    z.object({
      label: z.string(),
      data: z.array(z.number()),
    })
  ),
});

export type GetSpendingTrendsInput = z.infer<typeof getSpendingTrendsSchema>;

export async function getSpendingTrends(input: GetSpendingTrendsInput) {
  const groupBy = input.groupBy ?? "month";

  const expenses = await getExpenses({ category: input.category });

  // Sort by date ascending for trend display
  const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupMap: Record<string, number> = {};

  for (const exp of sorted) {
    const date = new Date(exp.date);
    let key: string;

    if (groupBy === "day") {
      key = exp.date;
    } else if (groupBy === "week") {
      const dayOfWeek = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
      key = `Week of ${monday.toISOString().split("T")[0]}`;
    } else {
      key = date.toLocaleString("default", { month: "short", year: "numeric" });
    }

    groupMap[key] = (groupMap[key] ?? 0) + exp.amount;
  }

  const labels = Object.keys(groupMap);
  const data = Object.values(groupMap).map(v => Math.round(v * 100) / 100);

  const datasetLabel = input.category
    ? `${input.category} Spending`
    : "Total Spending";

  return {
    labels,
    datasets: [{ label: datasetLabel, data }],
  };
}

// --- setBudget ---

export const setBudgetSchema = z.object({
  category: z.string().describe("The budget category (e.g., 'Food', 'Housing')"),
  amount: z.number().describe("The budget amount"),
});

export const setBudgetOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  category: z.string(),
  amount: z.number(),
});

export type SetBudgetInput = z.infer<typeof setBudgetSchema>;

export async function setBudget(input: SetBudgetInput) {
  const userId = await requireUserId();
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: userId,
      category: input.category,
      amount: input.amount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,category" }
  );

  if (error) {
    return {
      success: false,
      message: `Failed to set budget: ${error.message}`,
      category: input.category,
      amount: input.amount,
    };
  }

  return {
    success: true,
    message: `Budget for '${input.category}' set to $${input.amount}.`,
    category: input.category,
    amount: input.amount,
  };
}

// --- getBudgetOverview ---

export const getBudgetOverviewSchema = z.object({
  startDate: z.string().optional().describe("Filter expenses from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter expenses up to this date (YYYY-MM-DD)"),
});

export const budgetOverviewOutputSchema = z.array(
  z.object({
    category: z.string(),
    budgetAmount: z.number(),
    actualAmount: z.number(),
    transactionCount: z.number(),
  })
);

export type GetBudgetOverviewInput = z.infer<typeof getBudgetOverviewSchema>;

export async function getBudgetOverview(input: GetBudgetOverviewInput) {
  const supabase = getSupabaseBrowserClient();

  // Fetch budgets for this user (RLS auto-scopes)
  const { data: budgets, error: budgetsError } = await supabase
    .from("budgets")
    .select("category, amount");

  if (budgetsError) throw new Error(`Failed to fetch budgets: ${budgetsError.message}`);

  // Fetch expenses with optional date filters
  const expenses = await getExpenses({ startDate: input.startDate, endDate: input.endDate });

  // Build budget lookup
  const budgetMap: Record<string, number> = {};
  for (const b of budgets ?? []) {
    budgetMap[b.category] = Number(b.amount);
  }

  // Aggregate expenses by category
  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const exp of expenses) {
    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = { amount: 0, count: 0 };
    }
    categoryMap[exp.category].amount += exp.amount;
    categoryMap[exp.category].count += 1;
  }

  // Combine
  const allCategories = new Set([
    ...Object.keys(budgetMap),
    ...Object.keys(categoryMap),
  ]);

  return Array.from(allCategories).map(category => ({
    category,
    budgetAmount: budgetMap[category] ?? 0,
    actualAmount: Math.round((categoryMap[category]?.amount ?? 0) * 100) / 100,
    transactionCount: categoryMap[category]?.count ?? 0,
  }));
}
