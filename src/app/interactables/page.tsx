"use client";

import {
  MessageInput,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { BudgetCard } from "./components/budget-card";
import { SpendingSummary } from "./components/spending-summary";

export default function InteractablesPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      <div className="flex h-screen bg-background">
        {/* Chat Sidebar */}
        <div
          className={`${
            isChatOpen ? "w-80" : "w-0"
          } border-r border-border bg-card transition-all duration-300 flex flex-col relative`}
        >
          {isChatOpen && (
            <>
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  AI Assistant
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask me to update your budget or spending data
                </p>
              </div>

              <ScrollableMessageContainer className="flex-1 p-4">
                <ThreadContent variant="default">
                  <ThreadContentMessages />
                </ThreadContent>
              </ScrollableMessageContainer>

              <div className="p-4 border-t border-border">
                <MessageInput variant="bordered">
                  <MessageInputTextarea placeholder="Update my Food budget to $500..." />
                  <MessageInputToolbar>
                    <MessageInputSubmitButton />
                  </MessageInputToolbar>
                </MessageInput>
              </div>
            </>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="absolute -right-10 top-1/2 -translate-y-1/2 bg-card border border-border rounded-r-lg p-2 hover:bg-muted"
          >
            {isChatOpen ? (
              <ChevronLeft className="w-4 h-4 text-card-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-card-foreground" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-card-foreground mb-6">
              Finance Dashboard
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
              <div className="lg:col-span-2">
                <SpendingSummary
                  totalSpent={9474.24}
                  monthlyAverage={1579.04}
                  topCategory="Housing"
                  percentageChange={3.2}
                  onPropsUpdate={(newProps) => {
                    console.log("Spending summary updated:", newProps);
                  }}
                />
              </div>

              <BudgetCard
                category="Food"
                budgetAmount={400}
                currentSpending={395.75}
                remainingDays={12}
                onPropsUpdate={(newProps) => {
                  console.log("Food budget updated:", newProps);
                }}
              />

              <BudgetCard
                category="Housing"
                budgetAmount={1600}
                currentSpending={1500}
                remainingDays={12}
                onPropsUpdate={(newProps) => {
                  console.log("Housing budget updated:", newProps);
                }}
              />

              <BudgetCard
                category="Entertainment"
                budgetAmount={150}
                currentSpending={107}
                remainingDays={12}
                onPropsUpdate={(newProps) => {
                  console.log("Entertainment budget updated:", newProps);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}
