"use client";

import { useEffect, useState, type ReactNode } from "react";

import type {
  AgentActivityItem,
  AgentHubGatewayRead,
  AgentRead,
} from "@/api/generated/model";

/* ─── Palette colours per gateway index ───────────────────── */
const GATEWAY_GRADIENTS = [
  "from-violet-500/10 via-purple-500/5 to-transparent",
  "from-blue-500/10 via-cyan-500/5 to-transparent",
  "from-emerald-500/10 via-teal-500/5 to-transparent",
  "from-orange-500/10 via-amber-500/5 to-transparent",
  "from-pink-500/10 via-rose-500/5 to-transparent",
];

const GATEWAY_BORDER_COLORS = [
  "border-violet-200",
  "border-blue-200",
  "border-emerald-200",
  "border-orange-200",
  "border-pink-200",
];

const GATEWAY_ICON_COLORS = [
  "text-violet-500",
  "text-blue-500",
  "text-emerald-500",
  "text-orange-500",
  "text-pink-500",
];

const GATEWAY_ACCENT_TEXT = [
  "text-violet-600",
  "text-blue-600",
  "text-emerald-600",
  "text-orange-600",
  "text-pink-600",
];

const GATEWAY_SKILL_BG = [
  "bg-violet-50 border-violet-200 text-violet-700",
  "bg-blue-50 border-blue-200 text-blue-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
  "bg-orange-50 border-orange-200 text-orange-700",
  "bg-pink-50 border-pink-200 text-pink-700",
];

/* ─── Helpers ──────────────────────────────────────────────── */

function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "zojuist";
  if (diffMin < 60) return `${diffMin} min geleden`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}u geleden`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d geleden`;
}

function uptimeSince(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 2) return "Act. nu";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}u`;
  return `${Math.floor(diffH / 24)}d`;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    task_started: "Taak gestart",
    task_completed: "Taak voltooid",
    task_failed: "Taak mislukt",
    agent_woke: "Agent wakker",
    agent_heartbeat: "Heartbeat",
    skill_executed: "Skill uitgevoerd",
    comment_posted: "Opmerking geplaatst",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

function eventColor(type: string): string {
  if (type.includes("completed") || type.includes("woke")) return "bg-emerald-400";
  if (type.includes("failed") || type.includes("error")) return "bg-red-400";
  if (type.includes("started")) return "bg-blue-400";
  return "bg-slate-300";
}

/* ─── Status dot with pulse animation ─────────────────────── */
function StatusDot({ status }: { status?: string }) {
  const s = (status ?? "").toLowerCase();
  const isOnline = s === "online" || s === "active";
  const isProvisioning = s === "provisioning";

  if (isOnline) {
    return (
      <span className="relative inline-flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
    );
  }
  return (
    <span
      className={[
        "inline-block h-2.5 w-2.5 rounded-full flex-shrink-0",
        isProvisioning ? "bg-amber-400" : "bg-slate-300",
      ].join(" ")}
    />
  );
}

/* ─── Skill pills ──────────────────────────────────────────── */
const MAX_VISIBLE_SKILLS = 4;

function SkillPills({
  skills,
  colorClass = "bg-violet-50 border-violet-200 text-violet-700",
}: {
  skills: string[];
  colorClass?: string;
}) {
  const visible = skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflow = skills.length - MAX_VISIBLE_SKILLS;
  if (!skills.length) return <span className="text-slate-400 text-xs italic">Geen skills</span>;
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((s) => (
        <span
          key={s}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${colorClass}`}
        >
          {s}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          +{overflow}
        </span>
      )}
    </div>
  );
}

/* ─── Activity feed ────────────────────────────────────────── */
function ActivityFeed({ events }: { events: AgentActivityItem[] }) {
  if (!events.length) {
    return (
      <div className="px-5 pb-4 pt-1">
        <p className="text-[11px] text-slate-400 italic">Geen recente activiteit</p>
      </div>
    );
  }
  return (
    <div className="px-5 pb-4 pt-1 space-y-2">
      {events.map((ev, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${eventColor(ev.event_type)}`} />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-medium text-slate-700">{eventLabel(ev.event_type)}</span>
            {ev.agent_name && (
              <span className="text-[11px] text-slate-400 ml-1">· {ev.agent_name}</span>
            )}
            {ev.message && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{ev.message}</p>
            )}
          </div>
          <span className="text-[11px] text-slate-400 flex-shrink-0">{relativeTime(ev.created_at)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Agent row ────────────────────────────────────────────── */
function AgentRow({
  agent,
  accentClass,
}: {
  agent: AgentRead;
  accentClass: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-white/60 transition-all duration-150 group">
      <StatusDot status={agent.status} />

      {/* Name + session */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
          {agent.name}
        </p>
        <p className="text-[10px] text-slate-400 font-mono truncate">
          {agent.openclaw_session_id
            ? `${agent.openclaw_session_id.slice(0, 26)}…`
            : "—"}
        </p>
      </div>

      {/* Uptime */}
      <div className="flex-shrink-0 text-center hidden sm:block min-w-[48px]">
        <p className={`text-xs font-semibold ${accentClass}`}>
          {uptimeSince(agent.last_seen_at)}
        </p>
        <p className="text-[10px] text-slate-400">uptime</p>
      </div>

      {/* Last seen */}
      <div className="flex-shrink-0 text-right min-w-[80px]">
        <p className="text-[11px] text-slate-500">
          {agent.last_seen_at ? relativeTime(agent.last_seen_at) : "—"}
        </p>
        <p className="text-[10px] text-slate-400 capitalize">{agent.status ?? "—"}</p>
      </div>
    </div>
  );
}

/* ─── Gateway card ─────────────────────────────────────────── */
type GatewayTab = "agents" | "activity";

function GatewayCard({
  gateway,
  index,
  expanded: externalExpanded,
}: {
  gateway: AgentHubGatewayRead;
  index: number;
  expanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(externalExpanded);
  const [tab, setTab] = useState<GatewayTab>("agents");

  useEffect(() => {
    setIsExpanded(externalExpanded);
  }, [externalExpanded]);

  const gradient = GATEWAY_GRADIENTS[index % GATEWAY_GRADIENTS.length];
  const borderColor = GATEWAY_BORDER_COLORS[index % GATEWAY_BORDER_COLORS.length];
  const iconColor = GATEWAY_ICON_COLORS[index % GATEWAY_ICON_COLORS.length];
  const accentText = GATEWAY_ACCENT_TEXT[index % GATEWAY_ACCENT_TEXT.length];
  const skillBg = GATEWAY_SKILL_BG[index % GATEWAY_SKILL_BG.length];

  const onlineCount = gateway.agents.filter(
    (a) =>
      (a.status ?? "").toLowerCase() === "online" ||
      (a.status ?? "").toLowerCase() === "active",
  ).length;
  const allOnline = onlineCount === gateway.agents.length && onlineCount > 0;

  return (
    <div
      className={`rounded-xl border ${borderColor} bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md`}
    >
      {/* Header with gradient */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${gradient} bg-slate-50/80 hover:bg-opacity-80 transition-all text-left`}
      >
        {/* Gateway icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Name & meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-sm text-slate-900`}>
              {gateway.gateway_name}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/70 border ${borderColor} ${accentText} uppercase tracking-wide`}>
              VPS Gateway
            </span>
            {allOnline && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                ✓ Alle online
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[11px] text-slate-500">
              {gateway.agents.length} agent{gateway.agents.length !== 1 ? "s" : ""}
            </span>
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {onlineCount} online
              </span>
            )}
            {gateway.gateway_url && (
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                {gateway.gateway_url.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <p className="text-lg font-bold text-slate-800 leading-none">
              {gateway.total_tasks_done}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">gedaan</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className={`text-lg font-bold leading-none ${accentText}`}>
              {gateway.total_tasks_active}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">actief</p>
          </div>
          {/* Chevron */}
          <svg
            className={[
              "h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-90" : "",
            ].join(" ")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Skills row */}
      {gateway.gateway_skills.length > 0 && (
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/40 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mr-1 flex-shrink-0">
            Skills
          </span>
          <SkillPills skills={gateway.gateway_skills} colorClass={skillBg} />
        </div>
      )}

      {/* Body: tabs for agents / activity */}
      {isExpanded && (
        <div>
          {/* Tab bar */}
          <div className="flex items-center border-t border-slate-100 px-4 bg-white/60">
            <button
              type="button"
              onClick={() => setTab("agents")}
              className={[
                "text-[11px] font-medium py-2 px-3 border-b-2 transition-colors",
                tab === "agents"
                  ? `border-current ${accentText}`
                  : "border-transparent text-slate-400 hover:text-slate-600",
              ].join(" ")}
            >
              Agents ({gateway.agents.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("activity")}
              className={[
                "text-[11px] font-medium py-2 px-3 border-b-2 transition-colors",
                tab === "activity"
                  ? `border-current ${accentText}`
                  : "border-transparent text-slate-400 hover:text-slate-600",
              ].join(" ")}
            >
              Activiteit
              {gateway.recent_activity.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-100 text-[10px] text-slate-600">
                  {gateway.recent_activity.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          {tab === "agents" ? (
            <div className="divide-y divide-slate-100 px-1 py-1">
              {gateway.agents.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  Geen agents op deze gateway
                </p>
              ) : (
                gateway.agents.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    accentClass={accentText}
                  />
                ))
              )}
            </div>
          ) : (
            <ActivityFeed events={gateway.recent_activity} />
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
  icon,
  accentBg,
  accentText,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`h-10 w-10 rounded-lg ${accentBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${accentText}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Main view ────────────────────────────────────────────── */
export function AgentHubView({
  gateways,
  isLoading,
  onRefresh,
}: {
  gateways: AgentHubGatewayRead[];
  isLoading: boolean;
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [expandAll, setExpandAll] = useState(true);

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
  const totalSkills = new Set(gateways.flatMap((g) => g.gateway_skills)).size;

  const filtered = search.trim()
    ? gateways.filter(
        (g) =>
          g.gateway_name.toLowerCase().includes(search.toLowerCase()) ||
          g.agents.some((a) => a.name.toLowerCase().includes(search.toLowerCase())) ||
          g.gateway_skills.some((s) => s.toLowerCase().includes(search.toLowerCase())),
      )
    : gateways;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">Geen gateways gevonden</p>
        <p className="mt-1 text-xs text-slate-400">Registreer een gateway om van start te gaan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          label="Totaal agents"
          value={totalAgents}
          sub={`${onlineGateways} van ${gateways.length} gateways online`}
          accentBg="bg-violet-50"
          accentText="text-violet-700"
          icon={
            <svg className="h-5 w-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <SummaryCard
          label="Gateways online"
          value={onlineGateways}
          sub={`van ${gateways.length} totaal`}
          accentBg="bg-emerald-50"
          accentText="text-emerald-600"
          icon={
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9 12a3 3 0 116 0 3 3 0 01-6 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Taken actief"
          value={totalActive}
          accentBg="bg-blue-50"
          accentText="text-blue-600"
          icon={
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <SummaryCard
          label="Skills geïnstalleerd"
          value={totalSkills}
          sub={`${totalDone} taken voltooid`}
          accentBg="bg-amber-50"
          accentText="text-amber-600"
          icon={
            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          }
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Zoek gateway, agent of skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition"
          />
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setExpandAll((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {expandAll ? "Inklappen" : "Uitklappen"}
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <svg className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Filter hint */}
      {search && (
        <p className="text-xs text-slate-500">
          {filtered.length} van {gateways.length} gateways zichtbaar
        </p>
      )}

      {/* Gateway cards */}
      <div className="space-y-4">
        {filtered.map((gw, i) => (
          <GatewayCard
            key={gw.gateway_id}
            gateway={gw}
            index={gateways.indexOf(gw)}
            expanded={expandAll}
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">
            Geen resultaten voor &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
