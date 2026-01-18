"use client";

import { useState, useEffect } from "react";
import { Drawer, IconButton, Button, Box, Typography, Paper, TextField } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import TitlePage from "../../components/TitlePage";
import Filters from "../../components/Filters";
import ProductCard from "../../components/ProductCard";
import AddApparelModal from "../../components/AddApparelModal";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

export default function AdminApparels() {
  // Filters
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Apparels state
  const [apparels, setApparels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Apparel Drawer
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

  // Fetch apparels from API
  const fetchApparels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apparels"); // create this API
      if (!res.ok) throw new Error("Failed to fetch apparels");
      const data = await res.json();
      setApparels(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApparels();
  }, []);

  // Filtered apparels
  const filteredApparels = apparels.filter((f) => {
    const sportMatch = selectedSports.length === 0 || selectedSports.includes(f.sport);
    const priceMatch = selectedPrices.length === 0 || selectedPrices.includes(f.price);
    return sportMatch && priceMatch;
  });

  // Handle Add Apparel
  const onAddApparel = async (data) => {
    try {
      const res = await fetch("/api/apparels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add apparel");

      toast.success("Apparel added successfully!");
      setAddOpen(false);
      reset();
      fetchApparels(); // refresh list
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Box>
      <Toaster />
      <TitlePage title="Apparels" subtitle="Manage your sports apparels" />

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
                Apparels
              </Typography>
              <Button variant="contained" onClick={() => setAddOpen(true)}>
                Add Apparel
              </Button>
            </Box>

            <Box className="flex flex-wrap gap-8 items-center justify-center bg-white rounded-2xl shadow-inner p-4">
              {filteredApparels.map((f) => (
                <ProductCard
                  key={f._id}
                  id={f.id}
                  name={f.name}
                  price={f.price}
                  rating={f.rating}
                  image={f.thumbnail}
                  href={`/admin/apparel/${f._id}`}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Add Apparel Drawer */}
      <AddApparelModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fetchApparels={fetchApparels}
        title={"Apparel"}
      />
    </Box>
  );
}
