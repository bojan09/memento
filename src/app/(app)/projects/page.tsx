import type { Metadata } from "next";
import { ProjectsView } from "@/components/views/projects-view";

export const metadata: Metadata = { title: "Projects" };

// Projects come from the layout (they're also needed by capture), so this page has no query.
export default function ProjectsPage() {
  return <ProjectsView />;
}
