"use client";

import { useParams } from "next/navigation"; // for app router
import ProductDetail from "../../components/ProductDetailFacility";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";

export default function FacilityDetailPage() {
  const params = useParams();
  const { id } = params;
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFacility = async (facilityID) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/facilities/${facilityID}`); // create this API
      console.log(res);
      if (!res.ok) throw new Error("Failed to fetch facility");
      const data = await res.json();
      setFacility(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacility(id);
  }, [id]);

  return loading ? <Loader /> : facility && <ProductDetail product={facility} />;
}
