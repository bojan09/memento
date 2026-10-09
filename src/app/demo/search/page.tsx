import { Suspense } from "react";
import { DemoSearch } from "@/components/views/demo-views";

export default function Page() {
  return (
    <Suspense>
      <DemoSearch />
    </Suspense>
  );
}
