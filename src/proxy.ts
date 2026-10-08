import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets, icons, fonts, manifest and metadata images.
  matcher: [
    "/((?!_next/static|_next/image|fonts/|icons/|og-image.png|icon.svg|apple-icon.png|manifest.webmanifest|favicon.ico).*)",
  ],
};
