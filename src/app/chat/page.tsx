"use client";

import AuthButton from "@/components/AuthButton";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, currentTimeContextHelper, currentPageContextHelper } from "@tambo-ai/react";

/**
 * Home page component that renders the Tambo chat interface.
 *
 * @remarks
 * The `NEXT_PUBLIC_TAMBO_URL` environment variable specifies the URL of the Tambo server.
 * You do not need to set it if you are using the default Tambo server.
 * It is only required if you are running the API server locally.
 *
 * @see {@link https://github.com/tambo-ai/tambo/blob/main/CONTRIBUTING.md} for instructions on running the API server locally.
 */
export default function Home() {
  // Load MCP server configurations
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={{
        currentTime: currentTimeContextHelper,
        currentPage: currentPageContextHelper,
      }}
    >
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <h1 className="text-lg font-bold text-card-foreground">FinGenie</h1>
          <div className="flex items-center gap-3">
            <AuthButton />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <MessageThreadFull className="max-w-4xl mx-auto"/>
        </div>
      </div>
    </TamboProvider>
  );
}
