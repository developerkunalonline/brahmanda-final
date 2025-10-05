// src/components/shared/LoadingScreen.tsx
const LoadingScreen = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Initializing Systems...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;