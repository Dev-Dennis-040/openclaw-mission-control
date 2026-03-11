/**
 * Hand-written type for the Agent Hub endpoint.
 * Run `make api-gen` to replace with generated version once backend is deployed.
 */
import type { AgentRead } from "./agentRead";

export interface AgentActivityItem {
  event_type: string;
  message?: string | null;
  agent_name?: string | null;
  created_at: string;
}

export interface AgentHubGatewayRead {
  gateway_id: string;
  gateway_name: string;
  gateway_url: string;
  total_tasks_done: number;
  total_tasks_active: number;
  gateway_skills: string[];
  recent_activity: AgentActivityItem[];
  agents: AgentRead[];
}
