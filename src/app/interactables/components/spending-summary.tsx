"use client";

import { withInteractable } from "@tambo-ai/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const spendingSummarySchema = z.object({
  totalSpent: z.number().describe("Total amount spent"),
  monthlyAverage: z.number().describe("Average monthly spending"),
  topCategory: z.string().describe("The category with the highest spending"),
  percentageChange: z.number().describe("Percentage change from previous period (positive = increase, negative = decrease)"),
});

type SpendingSummaryProps = z.infer<typeof spendingSummarySchema>;

function SpendingSummaryBase(props: SpendingSummaryProps) {
  const [data, setData] = useState<SpendingSummaryProps>(props);
  const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
  const prevPropsRef = useRef<SpendingSummaryProps>(props);

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    const changedFields = new Set<string>();

    if (props.totalSpent !== prevProps.totalSpent) changedFields.add("totalSpent");
    if (props.monthlyAverage !== prevProps.monthlyAverage) changedFields.add("monthlyAverage");
    if (props.topCategory !== prevProps.topCategory) changedFields.add("topCategory");
    if (props.percentageChange !== prevProps.percentageChange) changedFields.add("percentageChange");

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

  const trendUp = data.percentageChange > 0;
  const trendDown = data.percentageChange < 0;

  return (
    <div className="bg-card border border-border shadow rounded-lg p-5">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        Spending Summary
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p
            className={`text-2xl font-bold text-card-foreground ${
              updatedFields.has("totalSpent") ? "animate-pulse" : ""
            }`}
          >
            ${data.totalSpent.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Monthly Average</p>
          <p
            className={`text-2xl font-bold text-card-foreground ${
              updatedFields.has("monthlyAverage") ? "animate-pulse" : ""
            }`}
          >
            ${data.monthlyAverage.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Top Category</p>
          <p
            className={`text-lg font-semibold text-card-foreground ${
              updatedFields.has("topCategory") ? "animate-pulse" : ""
            }`}
          >
            {data.topCategory}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Trend</p>
          <p
            className={`text-lg font-semibold flex items-center gap-1 ${
              trendUp
                ? "text-red-500"
                : trendDown
                ? "text-green-500"
                : "text-muted-foreground"
            } ${updatedFields.has("percentageChange") ? "animate-pulse" : ""}`}
          >
            {trendUp ? "↑" : trendDown ? "↓" : "—"}
            {Math.abs(data.percentageChange).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

const InteractableSpendingSummary = withInteractable(SpendingSummaryBase, {
  componentName: "SpendingSummary",
  description: "A spending summary card showing total spent, monthly average, top category, and trend",
  propsSchema: spendingSummarySchema,
});

export function SpendingSummary(props: SpendingSummaryProps & { onPropsUpdate?: (newProps: Record<string, unknown>) => void }) {
  return <InteractableSpendingSummary {...props} />;
}
