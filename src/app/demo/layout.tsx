import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { DemoAppProvider } from "@/components/app/demo-provider";
import { DemoBanner } from "@/components/views/demo-views";

export const metadata: Metadata = { title: { default: "Demo", template: "%s · Demo · memento" } };

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return (
    <DemoAppProvider>
      <AppShell banner={<DemoBanner />}>{children}</AppShell>
    </DemoAppProvider>
  );
}
