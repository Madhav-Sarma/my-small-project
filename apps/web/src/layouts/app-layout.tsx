import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { TopBar } from "../components/top-bar";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[#0a0a1a]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
