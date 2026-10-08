import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
