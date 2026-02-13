"use client";
import Loader from "@/app/components/Loader";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Facilities() {
  const [transaction, setTransaction] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const params = useParams();
  const { transactionId } = params;

  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent_id");

  useEffect(() => {
    fetchIntent();
  }, [paymentIntentId]);

  const fetchFacilityTransactions = async (payIntent) => {
    try {
      const params = new URLSearchParams();
      params.append("transactionId", String(transactionId));

      const res = await fetch(`/api/facility-transactions?${params.toString()}`);

      if (!res.ok) throw new Error("Failed to fetch facility transactions");
      const data = await res.json();
      setTransaction(data[0]);

      if (payIntent?.attributes?.status === "succeeded" && data[0].status !== "confirmed") {
        updateSucceeded(data[0]);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
    }
  };

  const fetchIntent = async () => {
    if (paymentIntentId) {
      const confirmRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_intent",
          paymentIntentId,
        }),
      });

      const confirmData = await confirmRes.json();
      setPaymentIntent(confirmData.paymentIntent);
      await fetchFacilityTransactions(confirmData.paymentIntent);
    }
  };

  const updateSucceeded = async (trans) => {
    try {
      if (trans?._id) {
        const res = await fetch("/api/facility-transactions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: trans._id, status: "confirmed" }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to confirmed transaction");

        fetchFacilityTransactions();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to confirmed transaction");
    } finally {
    }
  };

  return !transaction ? (
    <Loader />
  ) : (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 text-white py-6 px-8">
          <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
          <p className="text-sm opacity-90">Your booking has been successfully submitted.</p>
        </div>

        {/* Main content */}
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-3">
            {/* Notice / Heads-up */}
            <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 text-blue-800 px-4 py-3 rounded-lg shadow-sm">
              <svg
                className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                />
              </svg>
              <div>
                <p className="font-semibold">Heads-up!</p>
                <p className="text-sm text-blue-800 opacity-90">
                  Remember to save or take note of this reference number{" "}
                  <span
                    className="font-semibold underline cursor-pointer hover:text-blue-900"
                    onClick={() => {
                      navigator.clipboard.writeText(transaction._id);
                      toast.success("Copied Successfully");
                    }}
                    title="Click to copy"
                  >
                    {transaction._id}
                  </span>
                  . You’ll need it for your booking records.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Name</h3>
              <p className="text-gray-800">{transaction.userName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Email</h3>
              <p className="text-gray-800">{transaction.userEmail}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Contact Number</h3>
              <p className="text-gray-800">{transaction.userContact}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`font-semibold  text-green-600`}>{transaction.status.toUpperCase()}</p>
            </div>
          </div>

          {/* Booking Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Date</h3>
              <p className="text-gray-800">{transaction.date}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Start Time</h3>
              <p className="text-gray-800">{transaction.startTime}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">End Time</h3>
              <p className="text-gray-800">{transaction.endTime}</p>
            </div>
          </div>

          {/* Facility Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Facility</h3>
            <p className="text-gray-800">{transaction.facility.name}</p>
            <p className="text-gray-600 italic">
              {transaction.facility.sport} - {transaction.facility.description}
            </p>
            <p className="text-gray-800 font-semibold">Price: ₱{transaction.price}</p>

            {/* Images */}
            <div className="flex space-x-2 overflow-x-auto pt-2">
              {transaction.facility.images.map((img, i) => (
                <img key={i} src={img} alt={transaction.facility.name} className="h-24 w-32 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
