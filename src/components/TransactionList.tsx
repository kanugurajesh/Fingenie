"use client";

import React from "react";
import { useTamboStreamStatus } from "@tambo-ai/react";

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
          {transactions.map((transaction, index) => (
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
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransactionList;
