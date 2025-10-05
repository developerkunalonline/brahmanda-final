// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout"; // Assuming you have this
import PublicLayout from "@/components/layout/PublicLayout"; // Assuming you have this

// Pages...
import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AnnotationsPage from "./pages/my-research/MyResearchPage";
import KeplerDetailPage from "./pages/kepler/KeplerDetailPage";
import KeplerPage from "./pages/kepler/KeplerPage";
import SearchPage from "./pages/search/SearchPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TessDetailPage from "./pages/tess/TessDetailPage";
import TessPage from "./pages/tess/TessPage";
import MyResearchPage from "./pages/my-research/MyResearchPage";

function App() {
  const { isAuthLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isAuthLoading) {
    // Return a loading screen if you have one
    return <div>Loading Authentication...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* --- Protected Routes (Simplified Structure) --- */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* No more '/app' prefix needed here */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/datasets/kepler" element={<KeplerPage />} />
          <Route path="/datasets/kepler/:id" element={<KeplerDetailPage />} />
          <Route path="/datasets/tess" element={<TessPage />} />
          <Route path="/datasets/tess/:id" element={<TessDetailPage />} />
          <Route path="/annotations" element={<MyResearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* --- Catch-all remains the same --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
