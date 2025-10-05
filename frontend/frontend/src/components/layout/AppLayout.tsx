// src/components/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const AppLayout = () => {
  return (
    // The main container has a subtle ambient background from index.css
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* The main content area gets a futuristic grid overlay */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[url('/grid-bg.svg')] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
