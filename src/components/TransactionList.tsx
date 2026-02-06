import React from "react";

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
