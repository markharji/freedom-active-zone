"use client";

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import TitlePage from "../components/TitlePage";
import Filters from "../components/Filters";
import { Drawer, IconButton, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

export default function Facilities() {
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
            {loading ? (
              <Loader />
            ) : facilities.length === 0 ? (
              <div className="text-center text-gray-500 font-medium py-20">No facilities available.</div>
            ) : (
              <div className="flex flex-wrap gap-8 items-center justify-center">
                {facilities.map((f) => (
                  <ProductCard
                    key={f._id}
                    id={f.id}
                    name={f.name}
                    price={f.price}
                    rating={f.rating}
                    image={f.thumbnail || f.images[0]}
                    href={`/facilities/${f._id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
