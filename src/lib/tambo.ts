/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import BudgetForm from "@/components/BudgetForm";
import { budgetFormSchema } from "@/components/BudgetForm";
import BudgetOverview from "@/components/BudgetOverview";
import { budgetOverviewSchema } from "@/components/BudgetOverview";
import InsightCard from "@/components/InsightCard";
import TransactionList from "@/components/TransactionList";
import { Graph, graphSchema } from "@/components/tambo/graph";
import {
  addExpense,
  addExpenseSchema,
  getExpenses,
  getExpensesSchema,
  getSpendingInsights,
  getSpendingInsightsSchema,
  spendingInsightsOutputSchema,
  getSpendingTrends,
  getSpendingTrendsSchema,
  spendingTrendsOutputSchema,
  setBudget,
  setBudgetSchema,
  setBudgetOutputSchema,
  getBudgetOverview,
  getBudgetOverviewSchema,
  budgetOverviewOutputSchema,
} from "@/services/transactions";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "addExpense",
    description: "Adds a new financial expense to the user's expense tracker.",
    tool: addExpense,
    inputSchema: addExpenseSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  {
    name: "getExpenses",
    description: "Retrieves a list of financial expenses, with optional filtering by category and date range.",
    tool: getExpenses,
    inputSchema: getExpensesSchema,
    outputSchema: z.array(
      z.object({
        id: z.string(),
        date: z.string(),
        description: z.string(),
        amount: z.number(),
        category: z.string(),
      }),
    ),
  },
  {
    name: "getSpendingInsights",
    description: "Analyzes spending data and returns insights including total spending, averages, top category, and category breakdown. Use this when the user asks for spending analysis, insights, or summaries.",
    tool: getSpendingInsights,
    inputSchema: getSpendingInsightsSchema,
    outputSchema: spendingInsightsOutputSchema,
  },
  {
    name: "getSpendingTrends",
    description: "Returns spending data grouped by time period (day, week, or month) in a chart-ready format with labels and datasets. Use this when the user asks to see spending trends, charts, or visualizations over time.",
    tool: getSpendingTrends,
    inputSchema: getSpendingTrendsSchema,
    outputSchema: spendingTrendsOutputSchema,
  },
  {
    name: "setBudget",
    description: "Sets a budget amount for a specific spending category. Use this when the user wants to set or update a budget limit for a category.",
    tool: setBudget,
    inputSchema: setBudgetSchema,
    outputSchema: setBudgetOutputSchema,
  },
  {
    name: "getBudgetOverview",
    description: "Returns a budget overview comparing budgets vs actual spending per category. Use this when the user asks for a budget overview, budget status, or wants to see how their spending compares to their budgets.",
    tool: getBudgetOverview,
    inputSchema: getBudgetOverviewSchema,
    outputSchema: budgetOverviewOutputSchema,
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A chart component for visualizing financial data such as spending trends over time. Supports bar, line, and pie chart types. Use this to display spending trends data returned by the getSpendingTrends tool.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "BudgetForm",
    description: "An interactive form component for setting or updating a budget for a spending category. The user can fill in a category and amount, then submit. Use this when the user wants to create or manage a budget interactively.",
    component: BudgetForm,
    propsSchema: budgetFormSchema,
  },
  {
    name: "InsightCard",
    description: "A card component that displays a single financial insight or metric with a title, value, description, and optional trend indicator (up/down/neutral). Use this to present spending insights from the getSpendingInsights tool.",
    component: InsightCard,
    propsSchema: z.object({
      title: z.string().describe("The title of the insight card."),
      value: z.string().describe("The main value or metric to display."),
      description: z.string().describe("A brief description or explanation of the insight."),
      trend: z.enum(["up", "down", "neutral"]).optional().describe("Indicates the trend (e.g., 'up', 'down', 'neutral')."),
    }),
  },
  {
    name: "TransactionList",
    description: "A list component that displays financial transactions with date, description, category, and amount. Use this to show expense data returned by the getExpenses tool.",
    component: TransactionList,
    propsSchema: z.object({
      transactions: z.array(
        z.object({
          id: z.string().describe("Unique identifier for the transaction"),
          date: z.string().describe("Date of the transaction (e.g., 'YYYY-MM-DD')"),
          description: z.string().describe("Description of the transaction"),
          amount: z.number().describe("Amount of the transaction"),
          category: z.string().describe("Category of the transaction"),
        }),
      ),
      title: z.string().optional().describe("Optional title for the transaction list"),
    }),
  },
  {
    name: "BudgetOverview",
    description: "A budget overview component that shows progress bars comparing actual spending against budget limits per category. Use this to display data from the getBudgetOverview tool. Shows green (<80%), orange (80-100%), and red (>100%) progress bars.",
    component: BudgetOverview,
    propsSchema: budgetOverviewSchema,
  },
];
