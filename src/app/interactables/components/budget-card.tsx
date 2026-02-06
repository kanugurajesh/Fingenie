"use client";

import { withInteractable } from "@tambo-ai/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const budgetCardSchema = z.object({
  category: z.string().describe("The budget category name"),
  budgetAmount: z.number().describe("The total budget amount for this category"),
  currentSpending: z.number().describe("The current amount spent in this category"),
  remainingDays: z.number().optional().describe("Number of days remaining in the budget period"),
});

type BudgetCardProps = z.infer<typeof budgetCardSchema>;

function BudgetCardBase(props: BudgetCardProps) {
  const [data, setData] = useState<BudgetCardProps>(props);
  const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
  const prevPropsRef = useRef<BudgetCardProps>(props);

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    const changedFields = new Set<string>();

    if (props.category !== prevProps.category) changedFields.add("category");
    if (props.budgetAmount !== prevProps.budgetAmount) changedFields.add("budgetAmount");
    if (props.currentSpending !== prevProps.currentSpending) changedFields.add("currentSpending");
    if (props.remainingDays !== prevProps.remainingDays) changedFields.add("remainingDays");

    setData(props);
    prevPropsRef.current = props;

    if (changedFields.size > 0) {
      setUpdatedFields(changedFields);
      const timer = setTimeout(() => {
        setUpdatedFields(new Set());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [props]);

  const percentage = data.budgetAmount > 0
    ? (data.currentSpending / data.budgetAmount) * 100
    : 0;
  const remaining = data.budgetAmount - data.currentSpending;
  const barColor =
    percentage > 100
      ? "bg-destructive"
      : percentage >= 80
      ? "bg-orange-500"
      : "bg-green-500";
  const cappedWidth = Math.min(percentage, 100);

  return (
    <div className="bg-card border border-border shadow rounded-lg p-5">
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`text-lg font-semibold text-card-foreground ${
            updatedFields.has("category") ? "animate-pulse" : ""
          }`}
        >
          {data.category}
        </h3>
        {data.remainingDays !== undefined && (
          <span
            className={`text-xs text-muted-foreground bg-muted px-2 py-1 rounded ${
              updatedFields.has("remainingDays") ? "animate-pulse" : ""
            }`}
          >
            {data.remainingDays} days left
          </span>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span
            className={`text-card-foreground font-medium ${
              updatedFields.has("currentSpending") ? "animate-pulse" : ""
            }`}
          >
            ${data.currentSpending.toFixed(2)}
          </span>
          <span
            className={`text-muted-foreground ${
              updatedFields.has("budgetAmount") ? "animate-pulse" : ""
            }`}
          >
            / ${data.budgetAmount.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${cappedWidth}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span
          className={`text-sm font-medium ${
            remaining < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"
          }`}
        >
          {remaining >= 0
            ? `$${remaining.toFixed(2)} remaining`
            : `$${Math.abs(remaining).toFixed(2)} over budget`}
        </span>
        <span className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

const InteractableBudgetCard = withInteractable(BudgetCardBase, {
  componentName: "BudgetCard",
  description: "A budget tracking card showing spending progress for a category with progress bar",
  propsSchema: budgetCardSchema,
});

export function BudgetCard(props: BudgetCardProps & { onPropsUpdate?: (newProps: Record<string, unknown>) => void }) {
  return <InteractableBudgetCard {...props} />;
}
