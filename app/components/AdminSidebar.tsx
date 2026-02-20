"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminSidebar({ isOpen = true }) {
  const [collapsed, setCollapsed] = useState(!isOpen);

  const navItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Facilities", path: "/admin/facilities" },
    { label: "Apparel", path: "/admin/apparel" },
    { label: "Transactions", path: "/admin/transaction" },
    { label: "Users", path: "/admin/users" },
    // Add more admin routes here
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white shadow-md z-40 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button onClick={() => setCollapsed(!collapsed)} className="text-white focus:outline-none">
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="mt-4 flex flex-col space-y-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="text-lg">•</span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
