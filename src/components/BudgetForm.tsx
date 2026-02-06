"use client";

import { useTamboComponentState, useTamboStreamStatus } from "@tambo-ai/react";
import React from "react";
import { z } from "zod";
import { setBudget } from "@/services/transactions";

export const budgetFormSchema = z.object({
  initialCategory: z.string().optional().describe("Initial category for the budget form."),
  initialAmount: z.number().optional().describe("Initial amount for the budget form."),
});

type BudgetFormProps = z.infer<typeof budgetFormSchema>;

const BudgetForm: React.FC<BudgetFormProps> = ({
  initialCategory = "",
  initialAmount = 0,
}) => {
  const { streamStatus } = useTamboStreamStatus();
  const [category, setCategory] = useTamboComponentState<string>("category", initialCategory, initialCategory);
  const [amount, setAmount] = useTamboComponentState<number>("amount", initialAmount, initialAmount);
  const [submitted, setSubmitted] = useTamboComponentState<boolean>("submitted", false);

  if (streamStatus.isPending || streamStatus.isStreaming) {
    return (
      <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
        <div className="animate-pulse">
          <div className="h-6 w-28 bg-muted rounded mb-4" />
          <div className="space-y-4">
            <div>
              <div className="h-4 w-20 bg-muted rounded mb-1" />
              <div className="h-9 w-full bg-muted rounded" />
            </div>
            <div>
              <div className="h-4 w-16 bg-muted rounded mb-1" />
              <div className="h-9 w-full bg-muted rounded" />
            </div>
            <div className="h-9 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category && (amount ?? 0) > 0) {
      await setBudget({ category, amount: amount ?? 0 });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
        <h3 className="text-xl font-bold leading-none text-card-foreground mb-4">
          Budget Set
        </h3>
        <p className="text-muted-foreground">
          Budget for <span className="font-semibold text-card-foreground">{category}</span> set to{" "}
          <span className="font-semibold text-card-foreground">${(amount ?? 0).toFixed(2)}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
      <h3 className="text-xl font-bold leading-none text-card-foreground mb-4">
        Set Budget
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-muted-foreground"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 bg-card text-card-foreground focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-muted-foreground"
          >
            Amount
          </label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 bg-card text-card-foreground focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
            value={amount ?? ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setAmount(Number.isNaN(val) ? 0 : val);
            }}
            required
            min="0"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          Set Budget
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
