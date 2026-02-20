"use client";

import { useParams } from "next/navigation"; // for app router
import { apparel } from "../../../lib/data";
import ProductDetail from "../../components/ProductDetail";
import { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import toast from "react-hot-toast";

export default function FacilityDetailPage() {
  const params = useParams();
  const { id } = params;

  const [apparel, setApparel] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApparel = async (apparelID) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/apparels/${apparelID}`); // create this API

      if (!res.ok) throw new Error("Failed to fetch apparel");
      const data = await res.json();
      setApparel(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApparel(id);
  }, [id]);

  return loading ? <Loader /> : apparel && <ProductDetail product={apparel} />;
}
