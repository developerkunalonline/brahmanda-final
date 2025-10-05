import { Outlet } from 'react-router-dom';
import { Telescope } from 'lucide-react';

const PublicNavbar = () => (
  <nav className="absolute top-0 left-0 right-0 p-4 z-20">
    <div className="container mx-auto flex items-center">
      <Telescope className="h-8 w-8 text-star-command-blue" />
      <h1 className="ml-2 text-xl font-display font-bold text-foreground">Exo-Platform</h1>
    </div>
  </nav>
);


const PublicLayout = () => {
  return (
    <div>
      <PublicNavbar />
      <Outlet />
    </div>
  );
};

export default PublicLayout;