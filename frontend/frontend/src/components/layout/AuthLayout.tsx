// src/components/layout/AuthLayout.tsx
import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  // Ensure you have an image at public/auth-bg.jpg
  <div className="flex min-h-screen items-center justify-center bg-background p-4 bg-[url('/auth-bg.jpg')] bg-cover bg-center">
    <div className="absolute inset-0 bg-black/60" />
    <div className="z-10 w-full max-w-md">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
