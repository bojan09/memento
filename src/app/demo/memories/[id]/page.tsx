import { DemoMemory } from "@/components/views/demo-views";

export default async function Page(props: PageProps<"/demo/memories/[id]">) {
  const { id } = await props.params;
  return <DemoMemory id={id} />;
}
