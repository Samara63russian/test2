import { AuthScreen } from "@/components/auth-screen";
import { WorkspaceApp } from "@/components/workspace-app";
import { getOptionalActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { loadWorkspaceData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const actor = await getOptionalActor();
  if (!actor) {
    const setupAvailable = (await getDb().organization.count()) === 0;
    return <AuthScreen setupAvailable={setupAvailable} />;
  }
  const data = await loadWorkspaceData(actor.organizationId, actor.userId);
  return <WorkspaceApp initialData={data} />;
}
