"use client";

import { useState, useEffect } from "react";
import { Drawer, Button, Box, Typography, Tabs, Tab } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import TitlePage from "../../components/TitlePage";
import Filters from "../../components/Filters";
import ProductCard from "../../components/ProductCard";
import AddFacilityModal from "../../components/AddFacilityModal";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/app/components/Loader";
import FloorplanWithHotspot from "../../components/FloorplanWithHotspot";

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

  // Tabs
  const [tabValue, setTabValue] = useState(0); // 0 = List, 1 = Floorplan

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch facilities from API
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("sports", JSON.stringify(selectedSports));
      params.append("prices", JSON.stringify(selectedPrices));

      const res = await fetch(`/api/facilities?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch facilities");
      const data = await res.json();
      setFacilities(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedSports, selectedPrices]);

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

            {/* Tabs */}
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
              <Tab label="List View" />
              <Tab label="Floorplan" />
            </Tabs>

            <Box mt={4}>
              {loading ? (
                <Loader />
              ) : facilities.length === 0 ? (
                <div className="text-center text-gray-500 font-medium py-20">No facilities available.</div>
              ) : tabValue === 0 ? (
                // List View
                <Box className="flex flex-wrap gap-8 items-center justify-center bg-white rounded-2xl shadow-inner p-4">
                  {facilities.map((f) => (
                    <ProductCard
                      key={f._id}
                      id={f.id}
                      name={f.name}
                      price={f.price}
                      rating={f.rating}
                      image={f.thumbnail || f.images[0]}
                      href={`/admin/facilities/${f._id}`}
                    />
                  ))}
                </Box>
              ) : (
                // Floorplan View
                <Box className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded-xl">
                  <FloorplanWithHotspot facilities={facilities} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Add Facility Drawer */}
      <AddFacilityModal open={addOpen} onClose={() => setAddOpen(false)} fetchFacilities={fetchFacilities} />
    </Box>
  );
}
