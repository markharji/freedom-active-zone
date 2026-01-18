"use client";

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import TitlePage from "../components/TitlePage";
import Filters from "../components/Filters";
import { Drawer, IconButton, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function Facilities() {
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter facilities based on selected filters
  const filteredFacilities = facilities.filter((f) => {
    const sportMatch = selectedSports.length === 0 || selectedSports.includes(f.sport);
    const priceMatch = selectedPrices.length === 0 || selectedPrices.includes(f.price);
    return sportMatch && priceMatch;
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/facilities"); // create this API
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
  }, []);

  return (
    <>
      <TitlePage title="Facilities" subtitle="Book your favorite sports facilities today!" />

      <div className="mx-auto px-4 py-8">
        {/* Mobile Filter Button */}
        <div className="flex justify-end md:hidden mb-4">
          <Button variant="contained" startIcon={<FilterListIcon />} onClick={handleDrawerToggle}>
            Filters
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <Filters
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedPrices={selectedPrices}
              setSelectedPrices={setSelectedPrices}
            />
          </div>

          {/* Mobile Filters Drawer */}
          <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}>
            <Filters
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedPrices={selectedPrices}
              setSelectedPrices={setSelectedPrices}
            />
          </Drawer>

          {/* Facilities - Right Column */}
          <div className="flex-1 bg-white rounded-2xl shadow-inner p-4">
            <div className="flex flex-wrap gap-8 items-center justify-center">
              {filteredFacilities.map((f) => (
                <ProductCard
                  key={f._id}
                  id={f.id}
                  name={f.name}
                  price={f.price}
                  rating={f.rating}
                  image={f.thumbnail}
                  href={`/facilities/${f._id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
