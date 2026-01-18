"use client";

import { useParams } from "next/navigation"; // for app router
import { apparel } from "../../../lib/data";
import ProductDetail from "../../components/ProductDetail";
import { useEffect, useState } from "react";

export default function FacilityDetailPage() {
  const params = useParams();
  const { id } = params;

  const [apparel, setApparel] = useState(null);

  const fetchApparel = async (apparelID) => {
    console.log(apparelID);
    try {
      const res = await fetch(`/api/apparels/${apparelID}`); // create this API
      console.log(res);
      if (!res.ok) throw new Error("Failed to fetch apparel");
      const data = await res.json();
      setApparel(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
    }
  };

  useEffect(() => {
    fetchApparel(id);
  }, [id]);

  if (!apparel) {
    return <p className="text-center text-red-500 mt-20">Apparel not found!</p>;
  }

  return apparel && <ProductDetail product={apparel} />;
}
