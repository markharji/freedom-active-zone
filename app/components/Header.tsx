"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Header({ fromAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedStore, setIsLoggedStore] = useState(false);
  // Helper to prepend /admin if needed
  const route = (path) => (fromAdmin ? `/admin${path}` : path);

  const { user, loading, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("isLogged") === "true";
    setIsLoggedStore(stored);
  }, []);

  return (
    <header className="sticky top-0 left-0 w-full bg-gray-900 bg-opacity-95 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold">Freedom Active Zone</div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 font-semibold">
          <Link href={route("/")} className="hover:text-orange-400 transition-colors">
            Home
          </Link>
          <Link href={route("/facilities")} className="hover:text-orange-400 transition-colors">
            Facilities
          </Link>
          <Link href={route("/apparel")} className="hover:text-orange-400 transition-colors">
            Apparel
          </Link>
          {!fromAdmin && (
            <Link href={route("/transaction")} className="hover:text-orange-400 transition-colors">
              Transaction
            </Link>
          )}
          {fromAdmin && (isLoggedIn || isLoggedStore) && (
            <Link href={route("/rewards")} className="hover:text-orange-400 transition-colors">
              Rewards
            </Link>
          )}
          {fromAdmin && (isLoggedIn || isLoggedStore) && (
            <button onClick={logout} className="hover:text-orange-400 transition-colors">
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-gray-900 px-6 pb-4 space-y-2">
          <Link href={route("/")} className="block py-2 font-semibold hover:text-orange-400 transition-colors">
            Home
          </Link>
          <Link
            href={route("/facilities")}
            className="block py-2 font-semibold hover:text-orange-400 transition-colors"
          >
            Facilities
          </Link>
          <Link href={route("/apparel")} className="block py-2 font-semibold hover:text-orange-400 transition-colors">
            Apparel
          </Link>
          {fromAdmin && (isLoggedIn || isLoggedStore) && (
            <button onClick={logout} className="hover:text-orange-400 transition-colors">
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
