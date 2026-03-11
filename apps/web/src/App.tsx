import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout";
import { DashboardPage } from "./pages/dashboard";
import { ToolsPage } from "./pages/tools";
import { SuitesPage } from "./pages/suites";
import { AgentsPage } from "./pages/agents";
import { WorkflowsPage } from "./pages/workflows";
import { MarketplacePage } from "./pages/marketplace";
import { AppsPage } from "./pages/apps";
import { SettingsPage } from "./pages/settings";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
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
