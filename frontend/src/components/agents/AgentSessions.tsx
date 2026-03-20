"use client";

import { useState } from "react";
import { Send, User as UserIcon, Bot, MessageSquare } from "lucide-react";
import { useAuth } from "@/auth/clerk";
import { useOrganizationMembership } from "@/lib/use-organization-membership";

import {
  useListGatewaySessionsApiV1GatewaysSessionsGet,
  useGetSessionHistoryApiV1GatewaysSessionsSessionIdHistoryGet,
  useSendGatewaySessionMessageApiV1GatewaysSessionsSessionIdMessagePost,
} from "@/api/generated/gateways/gateways";
import { ApiError } from "@/api/mutator";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/atoms/Markdown";

// Base interfaces expected from OpenClaw Gateway sessions
interface SessionMeta {
  key: string;
  metadata?: {
    type?: string;
    username?: string;
    first_name?: string;
    [key: string]: string | undefined;
  };
}

interface ChatMessage {
  role: "user" | "assistant" | "system" | string;
  content: string;
  name?: string;
  timestamp?: string | number;
}

interface AgentSessionsProps {
  boardId?: string;
}

export function AgentSessions({ boardId }: AgentSessionsProps) {
  const { isSignedIn } = useAuth();
  const { isAdmin } = useOrganizationMembership(isSignedIn);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  // 1. Fetch available sessions
  const sessionsQuery = useListGatewaySessionsApiV1GatewaysSessionsGet({ board_id: boardId }, {
    query: {
      enabled: Boolean(isSignedIn && isAdmin && boardId),
      refetchInterval: 30_000,
    }
  });

  // Typecast the unknown sessions response
  const responseData = sessionsQuery.data?.data as { sessions?: SessionMeta[] } | undefined;
  const rawSessions = responseData?.sessions;
  const sessions = rawSessions ?? [];

  // Automatically select the first session if none is selected
  if (!selectedSessionId && sessions.length > 0) {
    setSelectedSessionId(sessions[0].key);
  }

  // 2. Fetch history for the selected session
  const historyQuery = useGetSessionHistoryApiV1GatewaysSessionsSessionIdHistoryGet(selectedSessionId ?? "", { board_id: boardId }, {
    query: {
      enabled: Boolean(isSignedIn && isAdmin && selectedSessionId),
      refetchInterval: 5_000, // Poll more frequently for active chat
    }
  });

  const historyData = historyQuery.data?.data as { history?: ChatMessage[] } | undefined;
  const rawHistory = historyData?.history;
  const history = rawHistory ?? [];

  // 3. Mutation to send a message to the gateway session
  const sendMessageMutation = useSendGatewaySessionMessageApiV1GatewaysSessionsSessionIdMessagePost<ApiError>({
    mutation: {
      onSuccess: () => {
        setMessageInput("");
        historyQuery.refetch();
      }
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedSessionId) return;

    sendMessageMutation.mutate({
      sessionId: selectedSessionId,
      params: { board_id: boardId },
      data: { content: messageInput.trim() }
    });
  };

  const getSessionName = (session: SessionMeta) => {
    const meta = session.metadata;
    if (meta?.type === "telegram") return meta.first_name || meta.username || session.key;
    if (meta?.type) return `${meta.type} (${session.key.substring(0, 8)})`;
    return session.key;
  };

  if (!boardId) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5 text-sm text-muted">
        No board linked to this agent. Sessions cannot be loaded.
      </div>
    );
  }

  return (
    <div className="grid h-[600px] gap-4 lg:grid-cols-[250px_1fr]">
      {/* Sidebar: Session List */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]">
        <div className="border-b border-[color:var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
            Conversations
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessionsQuery.isLoading ? (
            <div className="px-3 py-4 text-xs text-muted">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted">No sessions found.</div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li key={session.key}>
                  <button
                    onClick={() => setSelectedSessionId(session.key)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedSessionId === session.key
                        ? "bg-[color:var(--accent)] text-white"
                        : "text-muted hover:bg-[color:var(--surface)] hover:text-strong"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{getSessionName(session)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]">
        {/* Chat History Header */}
        <div className="border-b border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <p className="text-sm font-medium text-strong">
            {selectedSessionId 
              ? getSessionName(sessions.find((s) => s.key === selectedSessionId) || { key: selectedSessionId }) 
              : "Select a conversation"}
          </p>
          <p className="text-xs text-quiet">
            {selectedSessionId ? `ID: ${selectedSessionId}` : ""}
          </p>
        </div>

        {/* Chat Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
          {!selectedSessionId ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Select a session from the list to view history.
            </div>
          ) : historyQuery.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Loading chat history...
            </div>
          ) : history.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No messages in this session yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] border border-[color:var(--border)]">
                      {isUser ? <UserIcon className="h-4 w-4 text-muted" /> : <Bot className="h-4 w-4 text-[color:var(--accent)]" />}
                    </div>
                    <div className={`rounded-xl px-4 py-3 text-sm flex flex-col ${isUser ? "bg-[color:var(--accent)] text-white" : "bg-[color:var(--surface)] border border-[color:var(--border)] text-strong"}`}>
                       {msg.name && !isUser && <span className="text-xs font-semibold uppercase mb-1 opacity-70">{msg.name}</span>}
                       <div className="w-full break-words">
                         <Markdown content={msg.content} variant="comment" />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="border-t border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Send a message to this session..."
              disabled={!selectedSessionId || sendMessageMutation.isPending}
              className="flex-1 bg-[color:var(--surface-muted)]"
            />
            <Button
              type="submit"
              disabled={!messageInput.trim() || !selectedSessionId || sendMessageMutation.isPending}
              className="w-12 p-0"
            >
              {sendMessageMutation.isPending ? "..." : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
