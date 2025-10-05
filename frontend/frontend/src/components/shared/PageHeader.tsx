// src/components/shared/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div>
      <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        {title}
      </h1>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  );
};

export default PageHeader;