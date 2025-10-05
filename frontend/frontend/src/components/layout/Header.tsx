// src/components/layout/Header.tsx
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex h-20 shrink-0 items-center justify-end border-b border-[hsl(var(--glass-border))] bg-background/50 backdrop-blur-lg px-4 md:px-8">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-foreground">{user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          aria-label="Log out"
          className="hover:bg-destructive/20 rounded-full transition-colors"
        >
          <LogOut className="h-5 w-5 text-destructive" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
