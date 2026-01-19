"use client";

import { useEffect, useState } from "react";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import TitlePage from "../components/TitlePage";
import toast from "react-hot-toast";
import { Drawer, IconButton, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Loader from "../components/Loader";

export default function Apparel() {
  const [loading, setLoading] = useState(true);
  const [apparels, setApparels] = useState([]);

  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchApparels = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("sports", JSON.stringify(selectedSports));
      params.append("prices", JSON.stringify(selectedPrices));

      const res = await fetch(`/api/apparels?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch apparels");
      const data = await res.json();
      setApparels(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApparels();
  }, [selectedSports, selectedPrices]);

  return (
    <>
      <TitlePage title="Apparels" subtitle="Book your favorite sports apparels today!" />

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

          <div className="flex-1 bg-white rounded-2xl shadow-inner p-4">
            {loading ? (
              <Loader />
            ) : apparels.length === 0 ? (
              <div className="text-center text-gray-500 font-medium py-20">No apparels available.</div>
            ) : (
              <div className="flex flex-wrap gap-8 items-center justify-center">
                {apparels.map((f: any) => (
                  <ProductCard
                    key={f._id}
                    id={f._id}
                    name={f.name}
                    price={f.price}
                    rating={f.rating}
                    image={f.thumbnail}
                    href={`/apparel/${f._id}`}
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
