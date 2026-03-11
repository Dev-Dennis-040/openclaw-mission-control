"use client";

import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { useState } from "react";

import type { AgentHubGatewayRead, AgentRead } from "@/api/generated/model";

/* ─── helpers ─────────────────────────────────────────────── */

function StatusDot({ status }: { status?: string }) {
  const s = (status ?? "").toLowerCase();
  const isOnline = s === "online" || s === "active";
  const isProvisioning = s === "provisioning";
  return (
    <span
      className={[
        "inline-block h-2.5 w-2.5 rounded-full flex-shrink-0",
        isOnline
          ? "bg-emerald-500"
          : isProvisioning
            ? "bg-amber-400"
            : "bg-slate-300",
      ].join(" ")}
      title={status ?? "unknown"}
    />
  );
}

const MAX_VISIBLE_SKILLS = 3;

function SkillPills({ skills }: { skills: string[] }) {
  const visible = skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflow = skills.length - MAX_VISIBLE_SKILLS;
  if (!skills.length) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-medium text-violet-700 leading-tight"
        >
          {s}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          +{overflow}
        </span>
      )}
    </div>
  );
}

function AgentRow({ agent }: { agent: AgentRead }) {
  const skills = agent.installed_skills ?? [];
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
      {/* Status */}
      <StatusDot status={agent.status} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{agent.name}</p>
        <p className="text-[11px] text-slate-400 font-mono truncate">
          {agent.openclaw_session_id
            ? `${agent.openclaw_session_id.slice(0, 22)}…`
            : "—"}
        </p>
      </div>

      {/* Skills */}
      <div className="hidden sm:flex flex-shrink-0 max-w-[200px]">
        <SkillPills skills={skills} />
      </div>

      {/* Last seen */}
      <div className="flex-shrink-0 text-right">
        <p className="text-[11px] text-slate-400">
          {agent.last_seen_at
            ? formatDistanceToNow(new Date(agent.last_seen_at), {
                addSuffix: true,
                locale: nl,
              })
            : "—"}
        </p>
        <p className="text-[11px] text-slate-400 capitalize">{agent.status}</p>
      </div>
    </div>
  );
}

function GatewayCard({ gateway }: { gateway: AgentHubGatewayRead }) {
  const [expanded, setExpanded] = useState(true);
  const allSkills = [
    ...new Set(gateway.agents.flatMap((a) => a.installed_skills ?? [])),
  ];
  const onlineCount = gateway.agents.filter(
    (a) =>
      (a.status ?? "").toLowerCase() === "online" ||
      (a.status ?? "").toLowerCase() === "active",
  ).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Gateway header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        {/* Expand indicator */}
        <svg
          className={[
            "h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200",
            expanded ? "rotate-90" : "",
          ].join(" ")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>

        {/* Gateway name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">
              {gateway.gateway_name}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wide">
              VPS Gateway
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-slate-500">
              {gateway.agents.length} agent{gateway.agents.length !== 1 ? "s" : ""}
            </span>
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                {onlineCount} online
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <p className="text-base font-bold text-slate-900 leading-none">
              {gateway.total_tasks_done}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">gedaan</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-base font-bold text-indigo-600 leading-none">
              {gateway.total_tasks_active}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">actief</p>
          </div>
          {/* Skills summary */}
          <div className="hidden md:flex">
            <SkillPills skills={allSkills} />
          </div>
        </div>
      </button>

      {/* Agents list */}
      {expanded && (
        <div className="divide-y divide-slate-100 px-2 py-1">
          {gateway.agents.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Geen agents op deze gateway
            </p>
          ) : (
            gateway.agents.map((agent) => (
              <AgentRow key={agent.id} agent={agent} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Summary cards ────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "indigo" | "default";
}) {
  const text = {
    green: "text-emerald-600",
    indigo: "text-indigo-600",
    default: "text-slate-900",
  }[accent ?? "default"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${text}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Main view ────────────────────────────────────────────── */

export function AgentHubView({
  gateways,
  isLoading,
}: {
  gateways: AgentHubGatewayRead[];
  isLoading: boolean;
}) {
  const totalAgents = gateways.reduce((s, g) => s + g.agents.length, 0);
  const totalDone = gateways.reduce((s, g) => s + g.total_tasks_done, 0);
  const totalActive = gateways.reduce((s, g) => s + g.total_tasks_active, 0);
  const onlineGateways = gateways.filter((g) =>
    g.agents.some(
      (a) =>
        (a.status ?? "").toLowerCase() === "online" ||
        (a.status ?? "").toLowerCase() === "active",
    ),
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">Geen gateways gevonden</p>
        <p className="mt-1 text-xs text-slate-400">
          Registreer een gateway om van start te gaan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Totaal agents" value={totalAgents} />
        <SummaryCard
          label="Gateways online"
          value={onlineGateways}
          sub={`van ${gateways.length} totaal`}
          accent="green"
        />
        <SummaryCard
          label="Taken actief"
          value={totalActive}
          accent="indigo"
        />
        <SummaryCard
          label="Taken voltooid"
          value={totalDone}
          accent="default"
        />
      </div>

      {/* Gateway cards */}
      <div className="space-y-4">
        {gateways.map((gw) => (
          <GatewayCard key={gw.gateway_id} gateway={gw} />
        ))}
      </div>
    </div>
  );
}
