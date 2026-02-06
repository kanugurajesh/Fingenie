"use client";

import React from "react";
import { useTamboStreamStatus } from "@tambo-ai/react";

interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  trend?: "up" | "down" | "neutral";
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  description,
  trend = "neutral",
}) => {
  const { streamStatus } = useTamboStreamStatus();

  if (streamStatus.isPending || streamStatus.isStreaming) {
    return (
      <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8 flex flex-col justify-between">
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-muted rounded mb-2" />
          <div className="h-9 w-24 bg-muted rounded mb-4" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const trendColorClass =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
      ? "text-red-500"
      : "text-muted-foreground";

  const trendIcon =
    trend === "up" ? "↑" : trend === "down" ? "↓" : "—";

  return (
    <div className="bg-card border border-border shadow rounded-lg p-4 sm:p-6 xl:p-8 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold leading-none text-card-foreground mb-2">
          {title}
        </h3>
        <p className="text-3xl font-bold text-card-foreground mb-4">
          {value} <span className={`${trendColorClass} text-lg`}>{trendIcon}</span>
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default InsightCard;
