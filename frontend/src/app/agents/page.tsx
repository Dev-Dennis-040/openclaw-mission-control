"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/auth/clerk";
import { AgentHubView } from "@/components/agents/AgentHubView";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { Button } from "@/components/ui/button";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import { useAgentsHub } from "@/lib/use-agents-hub";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { isAdmin } = useOrganizationMembership(isSignedIn);

  const { data: gateways = [], isLoading } = useAgentsHub();

  const totalAgents = gateways.reduce((s, g) => s + g.agents.length, 0);

  return (
    <DashboardPageLayout
      signedOut={{
        message: "Sign in to view agents.",
        forceRedirectUrl: "/agents",
        signUpForceRedirectUrl: "/agents",
      }}
      title="Agent Hub"
      description={`${totalAgents} agent${totalAgents === 1 ? "" : "s"} across ${gateways.length} gateway${gateways.length === 1 ? "" : "s"}.`}
      headerActions={
        <Button onClick={() => router.push("/agents/new")}>New agent</Button>
      }
      isAdmin={isAdmin}
      adminOnlyMessage="Only organization owners and admins can access agents."
      stickyHeader
    >
      <AgentHubView gateways={gateways} isLoading={isLoading} />
    </DashboardPageLayout>
  );
}
