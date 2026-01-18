"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import { useEffect } from "react";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const fromAdmin = pathname?.startsWith("/admin") ?? false;

  return <Header fromAdmin={fromAdmin} />;
}
