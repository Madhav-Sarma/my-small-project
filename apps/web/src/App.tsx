import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";
import { AppLayout } from "./layouts/app-layout";
import { DashboardPage } from "./pages/dashboard";
import { ToolsPage } from "./pages/tools";
import { SuitesPage } from "./pages/suites";
import { AgentsPage } from "./pages/agents";
import { WorkflowsPage } from "./pages/workflows";
import { MarketplacePage } from "./pages/marketplace";
import { AppsPage } from "./pages/apps";
import { SettingsPage } from "./pages/settings";

function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
}

export function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/sign-in/*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-page">
            <SignIn routing="path" path="/sign-in" />
          </div>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-page">
            <SignUp routing="path" path="/sign-up" />
          </div>
        }
      />

      {/* Protected app routes */}
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/suites" element={<SuitesPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
