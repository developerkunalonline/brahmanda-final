// src/pages/auth/AuthLayout.tsx
import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  // Added 'animated-bg' to make the background image slowly pan, creating a more dynamic feel.
  <div className="flex min-h-screen items-center justify-center bg-background p-4 bg-[url('/auth-bg.jpg')] bg-cover bg-center animated-bg">
    {/* A slightly stronger blur adds to the depth effect. */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
    <div className="z-10 w-full max-w-md">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
