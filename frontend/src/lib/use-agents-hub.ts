import { useAuth } from "@/auth/clerk";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@/api/mutator";
import type { AgentHubGatewayRead } from "@/api/generated/model";

export function useAgentsHub() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["agents", "hub"],
    queryFn: async () => {
      const res = await customFetch<{ data: AgentHubGatewayRead[]; status: number }>(
        "/api/v1/agents/hub",
        { method: "GET" },
      );
      return res.data;
    },
    enabled: Boolean(isSignedIn),
    refetchInterval: 20_000,
    refetchOnMount: "always",
  });
}
