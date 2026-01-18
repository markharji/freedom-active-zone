"use client";

import ApparelTransactionsTable from "@/app/components/ApparelTransactionsTable";
import FacilityTransactionsTable from "@/app/components/FacilityTransactionsTable";
import TabsWrapper from "@/app/components/TabsWrapper";
import { useEffect, useState } from "react";

// Fetch facility transactions

export default function AdminHomePage() {
  const [facilityTransactions, setFacilityTransactions] = useState([]);
  const [apparelTransactions, setApparelTransactions] = useState([]);

  const fetchFacilityTransactions = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/facility-transactions`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch facility transactions");
    const data = await res.json();
    setFacilityTransactions(data);
  };

  // Fetch apparel transactions
  const fetchApparelTransactions = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/apparel-transactions`);
    if (!res.ok) throw new Error("Failed to fetch apparel transactions");
    const data = await res.json();
    setApparelTransactions(data);
  };

  useEffect(() => {
    fetchFacilityTransactions();
    fetchApparelTransactions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs wrapper handles switching */}
      <TabsWrapper
        tabs={[
          {
            label: "Facility Transactions",
            component: (
              <FacilityTransactionsTable
                data={facilityTransactions}
                fetchFacilityTransactions={fetchFacilityTransactions}
              />
            ),
          },
          {
            label: "Apparel Transactions",
            component: (
              <ApparelTransactionsTable
                data={apparelTransactions}
                fetchApparelTransactions={fetchApparelTransactions}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
