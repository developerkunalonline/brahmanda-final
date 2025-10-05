// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  Rocket,
  BarChart2,
  Telescope,
  Search,
  NotebookText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { name: "Search", href: "/search", icon: Search },
  { name: "Kepler Data", href: "/datasets/kepler", icon: Rocket },
  { name: "TESS Data", href: "/datasets/tess", icon: Telescope },
  { name: "My Research", href: "/annotations", icon: NotebookText },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar = () => (
  <aside className="hidden md:flex w-64 flex-col glass-effect m-4 p-4 !border-none">
    <div className="mb-8 flex items-center gap-2 px-3">
      <Telescope className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-display font-bold text-foreground">
        Exo-Platform
      </h1>
    </div>
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:bg-[hsl(var(--glass-highlight))] hover:text-foreground",
              isActive && "bg-primary/20 font-semibold text-primary"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
