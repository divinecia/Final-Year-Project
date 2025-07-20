import { ReactNode } from 'react';

export default function WorkerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="worker-layout">
      {children}
    </div>
  );
}
