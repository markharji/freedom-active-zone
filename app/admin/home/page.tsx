"use client";

import ApparelTransactionsTable from "@/app/components/ApparelTransactionsTable";
import FacilityTransactionsTable from "@/app/components/FacilityTransactionsTable";
import TabsWrapper from "@/app/components/TabsWrapper";

// Fetch facility transactions

export default function AdminHomePage() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs wrapper handles switching */}
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
    </div>
  );
}
