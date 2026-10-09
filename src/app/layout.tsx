import type { Metadata, Viewport } from "next";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "memento", template: "%s · memento" },
  description: "Capture now. Find it when it matters.",
  applicationName: "memento",
  appleWebApp: { capable: true, title: "memento", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
  openGraph: { title: "memento", description: "Capture now. Find it when it matters.", images: "/og-image.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#161B26" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/sora-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
