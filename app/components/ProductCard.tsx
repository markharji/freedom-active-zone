"use client";

import Link from "next/link";

export default function ProductCard({ id, name, price, rating, image, href }) {
  return (
    <Link href={href || `/product/${id}`} className="block w-[320px]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Responsive Thumbnail */}
        <div className="w-full h-64 overflow-hidden">
          {image && (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-orange-500 font-bold mb-2">₱{price}</p>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-5 w-5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.285-3.957a1 1 0 00-.364-1.118L2.04 9.385c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.951-.69l1.285-3.958z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-600 text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
