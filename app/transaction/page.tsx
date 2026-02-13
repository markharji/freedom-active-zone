"use client";
import Loader from "@/app/components/Loader";
import { Button, TextField } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Facilities() {
  const [transaction, setTransaction] = useState(null);

  const [loading, setLoading] = useState(false);

  const fetchFacilityTransactions = async (transactionId) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("transactionId", String(transactionId));

      const res = await fetch(`/api/facility-transactions?${params.toString()}`);

      if (!res.ok) throw new Error("Failed to fetch facility transactions");
      const data = await res.json();
      setTransaction(data[0]);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      transactionId: "",
    },
  });

  const onSubmit = (data) => {
    fetchFacilityTransactions(data.transactionId);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white  flex flex-col gap-4 w-full md:w-2/5 mx-auto p-4 shadow-md"
      >
        <div className="flex gap-2">
          <Controller
            name="transactionId"
            control={control}
            rules={{ required: "Reference ID is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Reference ID"
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                required
                fullWidth
              />
            )}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        transaction && (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 pt-2 px-4">
            <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full overflow-hidden">
              <div className="bg-[#101727] text-white py-6 px-8">
                <h1 className="text-2xl font-bold mb-1">Booking Details!</h1>
                <p className="text-sm opacity-90">This is your booking details.</p>
              </div>

              {/* Main content */}
              <div className="px-2 md:px-8 py-6 space-y-6">
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
                      <img
                        key={i}
                        src={img}
                        alt={transaction.facility.name}
                        className="h-24 w-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
