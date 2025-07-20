import { ReactNode } from 'react';

export default function HouseholdLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="household-layout">
      {children}
    </div>
  );
}
