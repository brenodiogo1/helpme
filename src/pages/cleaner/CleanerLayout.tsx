import CleanerSidebar from "@/components/CleanerSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Outlet } from "react-router-dom";

const CleanerLayout = () => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden md:block">
        <CleanerSidebar />
      </div>
      <div className="flex flex-col">
        <DashboardHeader>
          <CleanerSidebar />
        </DashboardHeader>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CleanerLayout;