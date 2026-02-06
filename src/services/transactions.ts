// src/services/transactions.ts

import { z } from "zod";

// Module-level mutable array so addExpense persists within a session
const allExpenses = [
  { id: "1", date: "2024-01-05", description: "Grocery shopping", amount: 75.5, category: "Food" },
  { id: "2", date: "2024-01-10", description: "Electric bill", amount: 95.0, category: "Utilities" },
  { id: "3", date: "2024-01-15", description: "Rent payment", amount: 1500.0, category: "Housing" },
  { id: "4", date: "2024-01-18", description: "Coffee shop", amount: 4.25, category: "Food" },
  { id: "5", date: "2024-01-22", description: "Bus pass", amount: 65.0, category: "Transport" },
  { id: "6", date: "2024-01-28", description: "Dinner with friends", amount: 120.0, category: "Social" },
  { id: "7", date: "2024-02-01", description: "Rent payment", amount: 1500.0, category: "Housing" },
  { id: "8", date: "2024-02-03", description: "Grocery shopping", amount: 82.3, category: "Food" },
  { id: "9", date: "2024-02-07", description: "Internet bill", amount: 60.0, category: "Utilities" },
  { id: "10", date: "2024-02-10", description: "Movie tickets", amount: 32.0, category: "Entertainment" },
  { id: "11", date: "2024-02-14", description: "Valentine dinner", amount: 95.0, category: "Social" },
  { id: "12", date: "2024-02-18", description: "Textbooks", amount: 145.0, category: "Education" },
  { id: "13", date: "2024-02-25", description: "Doctor visit copay", amount: 40.0, category: "Healthcare" },
  { id: "14", date: "2024-03-01", description: "Rent payment", amount: 1500.0, category: "Housing" },
  { id: "15", date: "2024-03-05", description: "Grocery shopping", amount: 68.9, category: "Food" },
  { id: "16", date: "2024-03-10", description: "Gas bill", amount: 45.0, category: "Utilities" },
  { id: "17", date: "2024-03-15", description: "Uber rides", amount: 28.5, category: "Transport" },
  { id: "18", date: "2024-03-20", description: "Concert tickets", amount: 75.0, category: "Entertainment" },
  { id: "19", date: "2024-04-01", description: "Rent payment", amount: 1500.0, category: "Housing" },
  { id: "20", date: "2024-04-08", description: "Grocery shopping", amount: 91.2, category: "Food" },
  { id: "21", date: "2024-04-12", description: "Online course", amount: 49.99, category: "Education" },
  { id: "22", date: "2024-04-18", description: "Prescription refill", amount: 25.0, category: "Healthcare" },
  { id: "23", date: "2024-05-01", description: "Rent payment", amount: 1500.0, category: "Housing" },
  { id: "24", date: "2024-05-10", description: "Grocery shopping", amount: 77.6, category: "Food" },
  { id: "25", date: "2024-06-01", description: "Rent payment", amount: 1500.0, category: "Housing" },
];

let nextId = 26;

// Budget store for session persistence
const budgetStore: Record<string, number> = {};

export const addExpenseSchema = z.object({
  description: z.string().describe("Description of the expense"),
  amount: z.number().describe("Amount of the expense"),
  category: z.string().describe("Category of the expense (e.g., 'Food', 'Utilities', 'Housing')"),
});

export type AddExpenseInput = z.infer<typeof addExpenseSchema>;

export async function addExpense(input: AddExpenseInput): Promise<{ success: boolean; message: string }> {
  const newExpense = {
    id: String(nextId++),
    date: new Date().toISOString().split("T")[0],
    description: input.description,
    amount: input.amount,
    category: input.category,
  };
  allExpenses.push(newExpense);
  return { success: true, message: `Expense '${input.description}' of $${input.amount} added to ${input.category}.` };
}

export const getExpensesSchema = z.object({
  category: z.string().optional().describe("Filter expenses by category"),
  startDate: z.string().optional().describe("Filter expenses from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter expenses up to this date (YYYY-MM-DD)"),
});

export type GetExpensesInput = z.infer<typeof getExpensesSchema>;

export async function getExpenses(input: GetExpensesInput): Promise<Array<{ id: string; date: string; description: string; amount: number; category: string }>> {
  let filteredExpenses = [...allExpenses];

  if (input.category) {
    filteredExpenses = filteredExpenses.filter(exp => exp.category.toLowerCase() === input.category!.toLowerCase());
  }
  if (input.startDate) {
    filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) >= new Date(input.startDate!));
  }
  if (input.endDate) {
    filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) <= new Date(input.endDate!));
  }

  return filteredExpenses;
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
  let filtered = [...allExpenses];

  if (input.category) {
    filtered = filtered.filter(exp => exp.category.toLowerCase() === input.category!.toLowerCase());
  }
  if (input.startDate) {
    filtered = filtered.filter(exp => new Date(exp.date) >= new Date(input.startDate!));
  }
  if (input.endDate) {
    filtered = filtered.filter(exp => new Date(exp.date) <= new Date(input.endDate!));
  }

  const totalSpending = filtered.reduce((sum, exp) => sum + exp.amount, 0);
  const transactionCount = filtered.length;
  const averageTransaction = transactionCount > 0 ? Math.round((totalSpending / transactionCount) * 100) / 100 : 0;

  // Group by category
  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const exp of filtered) {
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

  let filtered = [...allExpenses];
  if (input.category) {
    filtered = filtered.filter(exp => exp.category.toLowerCase() === input.category!.toLowerCase());
  }

  // Sort by date
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupMap: Record<string, number> = {};

  for (const exp of filtered) {
    const date = new Date(exp.date);
    let key: string;

    if (groupBy === "day") {
      key = exp.date;
    } else if (groupBy === "week") {
      // Get the Monday of the week
      const dayOfWeek = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
      key = `Week of ${monday.toISOString().split("T")[0]}`;
    } else {
      // month
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
  budgetStore[input.category] = input.amount;
  return {
    success: true,
    message: `Budget for '${input.category}' set to $${input.amount}.`,
    category: input.category,
    amount: input.amount,
  };
}
