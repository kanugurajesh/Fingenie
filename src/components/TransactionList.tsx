"use client";

import React, { useState } from "react";
import { useTamboStreamStatus } from "@tambo-ai/react";
import { deleteExpense } from "@/services/transactions";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions = [],
  title = "Transactions",
}) => {
  const { streamStatus } = useTamboStreamStatus();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    const result = await deleteExpense({ expenseId: id });
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (result.success) {
      setDeletedIds((prev) => new Set(prev).add(id));
    }
  };

  const visibleTransactions = transactions.filter((t) => !deletedIds.has(t.id));

  if (streamStatus.isPending || streamStatus.isStreaming) {
    return (
      <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
        <div className="h-6 w-40 bg-muted rounded mb-4 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="flex-1 min-w-0">
                <div className="h-4 w-36 bg-muted rounded mb-1" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8">
      <h3 className="text-xl font-bold leading-none text-card-foreground mb-4">
        {title}
      </h3>
      <div className="flow-root">
        <ul role="list" className="divide-y divide-border">
          {visibleTransactions.map((transaction, index) => (
            <li key={transaction.id ?? `${transaction.description}-${index}`} className="py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {transaction.date} - {transaction.category}
                  </p>
                </div>
                <div className="inline-flex items-center text-base font-semibold text-card-foreground">
                  ${(transaction.amount ?? 0).toFixed(2)}
                </div>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingIds.has(transaction.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete expense"
                >
                  {deletingIds.has(transaction.id) ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransactionList;
