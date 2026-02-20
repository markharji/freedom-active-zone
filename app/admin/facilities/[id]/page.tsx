"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductDetailAdmin from "@/app/components/ProductDetailFacilityAdmin";

export default function FacilityDetailPage() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);

  const fetchFacility = async (facilityID) => {
    try {
      const res = await fetch(`/api/facilities/${facilityID}`); // create this API

      if (!res.ok) throw new Error("Failed to fetch facility");
      const data = await res.json();
      setFacility(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
    }
  };

  useEffect(() => {
    fetchFacility(id);
  }, [id]);

  return facility && <ProductDetailAdmin product={facility} />;
}
