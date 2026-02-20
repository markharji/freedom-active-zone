"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductDetailAdmin from "../../../components/ProductDetailApparelAdmin";

export default function ApparelDetailPage() {
  const { id } = useParams();
  const [apparel, setApparel] = useState(null);

  const fetchApparel = async (apparelID) => {
    console.log(apparelID);
    try {
      const res = await fetch(`/api/apparels/${apparelID}`); // create this API

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

  return apparel && <ProductDetailAdmin product={apparel} />;
}
