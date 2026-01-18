"use client";

import ApparelTransactionsTable from "@/app/components/ApparelTransactionsTable";
import FacilityTransactionsTable from "@/app/components/FacilityTransactionsTable";
import TabsWrapper from "@/app/components/TabsWrapper";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Fetch facility transactions

export default function AdminHomePage() {
  const [facilityTransactions, setFacilityTransactions] = useState([]);
  const [apparelTransactions, setApparelTransactions] = useState([]);

  const fetchFacilityTransactions = async () => {
    try {
      const res = await fetch(`/api/facility-transactions`);
      if (!res.ok) throw new Error("Failed to fetch facility transactions");
      const data = await res.json();
      setFacilityTransactions(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
    }
  };

  const fetchApparelTransactions = async () => {
    try {
      const res = await fetch(`/api/apparel-transactions`);
      if (!res.ok) throw new Error("Failed to fetch apparel transactions");
      const data = await res.json();
      setApparelTransactions(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
    }
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
