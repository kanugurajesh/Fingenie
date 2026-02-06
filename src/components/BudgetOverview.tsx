"use client";

import React from "react";
import { useTamboStreamStatus } from "@tambo-ai/react";
import { z } from "zod";

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
        {budgets.map((budget, index) => {
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

          return (
            <div key={`${budget.category}-${index}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-card-foreground">
                  {budget.category}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${actual.toFixed(2)}
                  {budgetAmt > 0
                    ? ` / $${budgetAmt.toFixed(2)}`
                    : " (no budget set)"}
                </span>
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
