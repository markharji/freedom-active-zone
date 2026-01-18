"use client";

import { useEffect, useState } from "react";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import TitlePage from "../components/TitlePage";
import toast from "react-hot-toast";

export default function Apparel() {
  const [loading, setLoading] = useState(false);
  const [apparels, setApparels] = useState([]);

  const fetchApparels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apparels"); // create this API
      if (!res.ok) throw new Error("Failed to fetch facilities");
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

  return (
    <>
      <TitlePage title="Sports Apparel" subtitle="Book your favorite sports apparel today!" />

      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Filters />

          <div className="flex-1 bg-white rounded-2xl shadow-inner p-4">
            <div className="flex flex-wrap gap-8 items-center justify-center">
              {apparels?.map((f) => (
                <ProductCard
                  key={f._id}
                  id={f.id}
                  name={f.name}
                  price={f.price}
                  rating={f.rating}
                  image={f.thumbnail}
                  href={`/apparel/${f._id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
