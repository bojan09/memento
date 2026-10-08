import type { ReactNode } from "react";

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="state">
      <span className="node" aria-hidden />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
