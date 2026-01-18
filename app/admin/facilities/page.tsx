"use client";

import { useState, useEffect } from "react";
import { Drawer, IconButton, Button, Box, Typography, Paper, TextField } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import TitlePage from "../../components/TitlePage";
import Filters from "../../components/Filters";
import ProductCard from "../../components/ProductCard";
import AddFacilityModal from "../../components/AddFacilityModal";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

export default function AdminFacilities() {
  // Filters
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Facilities state
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Facility Drawer
  const [addOpen, setAddOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sport: null,
    },
  });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Fetch facilities from API
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("sports", JSON.stringify(selectedSports));
      params.append("prices", JSON.stringify(selectedPrices));

      const res = await fetch(`/api/facilities?${params.toString()}`); // create this API
      if (!res.ok) throw new Error("Failed to fetch facilities");
      const data = await res.json();
      setFacilities(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedSports, selectedPrices]);

  // Handle Add Facility
  const onAddFacility = async (data) => {
    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add facility");

      toast.success("Facility added successfully!");
      setAddOpen(false);
      reset();
      fetchFacilities(); // refresh list
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Box>
      <Toaster />
      <TitlePage title="Facilities" subtitle="Manage your sports facilities" />

      <Box className="mx-auto px-4 py-8">
        {/* Mobile Filter Button */}
        <Box className="flex justify-end md:hidden mb-4">
          <Button variant="contained" startIcon={<FilterListIcon />} onClick={handleDrawerToggle}>
            Filters
          </Button>
        </Box>

        <Box className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters */}
          <Box className="hidden md:block">
            <Filters
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedPrices={selectedPrices}
              setSelectedPrices={setSelectedPrices}
            />
          </Box>

          {/* Mobile Filters Drawer */}
          <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}>
            <Filters
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedPrices={selectedPrices}
              setSelectedPrices={setSelectedPrices}
            />
          </Drawer>

          {/* Right Column */}
          <Box className="flex-1">
            <Box display="flex" justifyContent="space-between" mb={4}>
              <Typography variant="h5" fontWeight="bold">
                Facilities
              </Typography>
              <Button variant="contained" onClick={() => setAddOpen(true)}>
                Add Facility
              </Button>
            </Box>

            {facilities.length === 0 ? (
              <div className="text-center text-gray-500 font-medium py-20">No facilities available.</div>
            ) : (
              <Box className="flex flex-wrap gap-8 items-center justify-center bg-white rounded-2xl shadow-inner p-4">
                {facilities.map((f) => (
                  <ProductCard
                    key={f._id}
                    id={f.id}
                    name={f.name}
                    price={f.price}
                    rating={f.rating}
                    image={f.thumbnail}
                    href={`/admin/facilities/${f._id}`}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add Facility Drawer */}
      <AddFacilityModal open={addOpen} onClose={() => setAddOpen(false)} fetchFacilities={fetchFacilities} />
    </Box>
  );
}
