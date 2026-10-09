import { Suspense } from "react";
import { DemoMemories } from "@/components/views/demo-views";

export default function Page() {
  return (
    <Suspense>
      <DemoMemories />
    </Suspense>
  );
}
