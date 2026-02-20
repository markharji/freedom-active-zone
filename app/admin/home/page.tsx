"use client";

import { useState } from "react";
import ApparelTransactionsTable from "@/app/components/ApparelTransactionsTable";
import FacilityTransactionsTable from "@/app/components/FacilityTransactionsTable";
import SportsSchedule from "@/app/components/SportsSchedule";
import TabsWrapper from "@/app/components/TabsWrapper";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function AdminHomePage() {
  const [activeSection, setActiveSection] = useState(1); // 0 = Transactions, 1 = Schedules
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-screen w-64 bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-6">
          <div className="flex items-center justify-between mb-8">
            {/* Close button for mobile */}
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          {/* Menu items */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveSection(1)}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                activeSection === 1 ? "bg-[#101727] text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Schedules
            </button>
            <button
              onClick={() => setActiveSection(0)}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                activeSection === 0 ? "bg-[#101727] text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Transactions
            </button>
          </div>
        </div>

        {/* Optional footer in sidebar */}
        <div className="mt-auto px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Freedom Active Zone
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-6 overflow-auto">
        {/* Mobile menu button */}
        <div className="md:hidden mb-4">
          <button className="p-2 rounded-md bg-gray-200 hover:bg-gray-300" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </button>
        </div>

        {/* Conditional rendering */}
        {activeSection === 0 && (
          <TabsWrapper
            tabs={[
              {
                label: "Facility Transactions",
                component: <FacilityTransactionsTable />,
              },
              {
                label: "Apparel Transactions",
                component: <ApparelTransactionsTable />,
              },
            ]}
          />
        )}

        <div className={`${activeSection === 1 ? "block" : "hidden"} mt-4 bg-white rounded-xl shadow p-4`}>
          <SportsSchedule section={activeSection} />
        </div>
      </main>
    </div>
  );
}
