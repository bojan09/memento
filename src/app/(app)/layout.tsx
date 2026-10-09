import { AppShell } from "@/components/app/app-shell";
import { LiveAppProvider } from "@/components/app/live-provider";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/data";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const projects = await listProjects();
  return (
    <LiveAppProvider userId={user.id} projects={projects}>
      <AppShell>{children}</AppShell>
    </LiveAppProvider>
  );
}
