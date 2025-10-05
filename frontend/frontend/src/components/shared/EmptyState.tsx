// src/components/shared/EmptyState.tsx

import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

interface EmptyStateProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
}

const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full glass-effect rounded-lg">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmptyState;