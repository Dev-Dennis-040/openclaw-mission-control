/**
 * Hand-written type for the Agent Hub endpoint.
 * Run `make api-gen` to replace with generated version once backend is deployed.
 */
import type { AgentRead } from "./agentRead";

export interface AgentHubGatewayRead {
  gateway_id: string;
  gateway_name: string;
  total_tasks_done: number;
  total_tasks_active: number;
  agents: AgentRead[];
}
