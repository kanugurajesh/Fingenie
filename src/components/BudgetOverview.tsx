"use client";

import React, { useState } from "react";
import { useTamboStreamStatus } from "@tambo-ai/react";
import { z } from "zod";
import { deleteBudget } from "@/services/transactions";

export const budgetOverviewSchema = z.object({
  budgets: z.array(
    z.object({
      category: z.string().describe("The budget category name"),
      budgetAmount: z.number().describe("The budget limit for this category"),
      actualAmount: z.number().describe("The actual amount spent in this category"),
      transactionCount: z.number().describe("Number of transactions in this category"),
    })
  ).describe("Array of budget data per category"),
});

type BudgetOverviewProps = z.infer<typeof budgetOverviewSchema>;

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets = [] }) => {
  const { streamStatus } = useTamboStreamStatus();
  const [deletedCategories, setDeletedCategories] = useState<Set<string>>(new Set());
  const [deletingCategories, setDeletingCategories] = useState<Set<string>>(new Set());

  const handleDelete = async (category: string) => {
    setDeletingCategories((prev) => new Set(prev).add(category));
    const result = await deleteBudget({ category });
    setDeletingCategories((prev) => {
      const next = new Set(prev);
      next.delete(category);
      return next;
    });
    if (result.success) {
      setDeletedCategories((prev) => new Set(prev).add(category));
    }
  };

  const visibleBudgets = budgets.filter((b) => !deletedCategories.has(b.category));

  if (streamStatus.isPending || streamStatus.isStreaming) {
    return (
      <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
        <div className="h-6 w-40 bg-muted rounded mb-4 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
      <h3 className="text-xl font-bold leading-none text-card-foreground mb-4">
        Budget Overview
      </h3>
      <div className="space-y-4">
        {visibleBudgets.map((budget, index) => {
          const actual = budget.actualAmount ?? 0;
          const budgetAmt = budget.budgetAmount ?? 0;
          const count = budget.transactionCount ?? 0;
          const percentage =
            budgetAmt > 0
              ? (actual / budgetAmt) * 100
              : 0;
          const barColor =
            percentage > 100
              ? "bg-destructive"
              : percentage >= 80
              ? "bg-orange-500"
              : "bg-green-500";
          const cappedWidth = Math.min(percentage, 100);
          const isDeleting = deletingCategories.has(budget.category);

          return (
            <div key={`${budget.category}-${index}`} className={isDeleting ? "opacity-50" : ""}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-card-foreground">
                  {budget.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    ${actual.toFixed(2)}
                    {budgetAmt > 0
                      ? ` / $${budgetAmt.toFixed(2)}`
                      : " (no budget set)"}
                  </span>
                  {budgetAmt > 0 && (
                    <button
                      onClick={() => handleDelete(budget.category)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      title={`Delete ${budget.category} budget`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {budgetAmt > 0 ? (
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`${barColor} h-2.5 rounded-full transition-all duration-300`}
                    style={{ width: `${cappedWidth}%` }}
                  />
                </div>
              ) : (
                <div className="w-full bg-muted rounded-full h-2.5" />
              )}
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {count} transaction{count !== 1 ? "s" : ""}
                </span>
                {budgetAmt > 0 && (
                  <span
                    className={`text-xs font-medium ${
                      percentage > 100 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetOverview;
