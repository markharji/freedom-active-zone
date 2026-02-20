"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Loader from "./components/Loader";
import Testimonials from "./components/Testimonials";
import FloorplanWithHotspot from "./components/FloorplanWithHotspot";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const workHoursRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [loadingApparels, setLoadingApparels] = useState(true);
  const [apparels, setApparels] = useState([]);
  const workHours = {
    Mon: "09:00 am – 05:00 pm",
    Tue: "09:00 am – 05:00 pm",
    Wed: "09:00 am – 05:00 pm",
    Thu: "09:00 am – 05:00 pm",
    Fri: "09:00 am – 05:00 pm",
    Sat: "Closed",
    Sun: "Closed",
  };

  // Get current day
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = days[new Date().getDay()];

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limitParam", "3");

      const res = await fetch(`/api/facilities?${params.toString()}`); // create this API
      if (!res.ok) throw new Error("Failed to fetch facilities");
      const data = await res.json();
      setFacilities(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApparels = async () => {
    setLoadingApparels(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("limitParam", "3");

      const res = await fetch(`/api/apparels?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch apparels");
      const data = await res.json();
      setApparels(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingApparels(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchApparels();
  }, []);

  useEffect(() => {
    if (workHoursRef.current) {
      setMaxHeight(isOpen ? `${workHoursRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  return (
    <>
      <section
        id="home"
        className="relative bg-gray-900 text-white pt-24"
        style={{
          backgroundImage: "url('/basketball.jpg')",
          backgroundSize: "cover", // make it cover the whole section
          backgroundPosition: "center", // center the image
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center py-32 px-6 text-center">
          <h1 className="text-5xl font-extrabold sm:text-6xl text-gray-900">Elevate Your Game</h1>
          <div className="relative max-w-2xl mt-4">
            <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
            <p className="relative text-lg sm:text-xl text-white font-medium p-4">
              Join our sports community and book courts for basketball, pickleball, and more!
            </p>
          </div>
          <Link
            href="/facilities"
            className="mt-8 inline-block rounded-full bg-gray-900 px-8 py-3 text-lg font-bold uppercase tracking-wide hover:bg-orange-600 transition-colors duration-300 shadow-lg"
          >
            Book Your Court
          </Link>
        </div>
      </section>

      {/* About / Facilities Section */}
      <section id="facilities" className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Our Facilities</h2>
        <p className="mt-4 max-w-3xl mx-auto text-gray-700 text-lg sm:text-xl">
          At Freedom Sports Club, we create an energetic and welcoming space for athletes of all levels. Play, train,
          and connect with others in our top-notch sports facilities.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="w-64 rounded-lg bg-gray-900 shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-white mb-2">Basketball Courts</h3>
            <p className="text-gray-300">Premium indoor and outdoor courts designed for competitive and casual play.</p>
          </div>
          <div className="w-64 rounded-lg bg-gray-900 shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-white mb-2">Pickleball</h3>
            <p className="text-gray-300">
              Enjoy our modern pickleball courts with professional-grade flooring and nets.
            </p>
          </div>
          <div className="w-64 rounded-lg bg-gray-900 shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-white mb-2">Sports Apparels</h3>
            <p className="text-gray-300">
              Enjoy our premium sports apparel, designed for comfort and performance during every game.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {/* <section id="apparel" className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Apparels & Courts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <Loader />
          ) : (
            facilities.map((facility: any, i) => (
              <Link
                href={`/facilities/${facility._id}`}
                key={i}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:scale-105"
              >
                <Image
                  src={facility.thumbnail}
                  alt={`Facility ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="absolute bottom-4 left-4 text-left">
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">{facility.name}</h3>
                  <p className="text-gray-200 text-sm drop-shadow-sm">{facility.sport || ""}</p>
                </div>
              </Link>
            ))
          )}

          {loadingApparels ? (
            <Loader />
          ) : (
            apparels.map((apparel: any, i) => (
              <Link
                href={`/apparel/${apparel._id}`}
                key={i}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:scale-105"
              >
                <Image
                  src={apparel.thumbnail}
                  alt={`Apparel ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="absolute bottom-4 left-4 text-left">
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">{apparel.name}</h3>
                  <p className="text-gray-200 text-sm drop-shadow-sm">{apparel.category || ""}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section> */}

      <section id="floorplan" className="py-4 px-2 bg-white text-center mb-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Book Courts Now</h2>
        <FloorplanWithHotspot facilities={facilities} />
      </section>
      {/* Contact Section */}
      <section className="bg-gray-900 py-20 text-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left">
          <h2 className="text-4xl font-bold text-white mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-12 max-w-2xl">
            Better yet, see us in person! Have a question about our products or how we can match your specific needs? If
            you have a close deadline or a special request, send us a message, and we will get back to you as soon as we
            can.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Location */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Location
              </h3>
              <p className="text-gray-300">Freedom, ZC, ZAMBOANGA CITY, ZAMBOANGA DEL SUR 7000</p>
            </div>

            {/* Phone */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3.5A1.5 1.5 0 013.5 2h1A1.5 1.5 0 016 3.5v1A1.5 1.5 0 014.5 6h-1A1.5 1.5 0 012 4.5v-1zM3.5 3a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1z" />
                  <path
                    fillRule="evenodd"
                    d="M6.707 8.293a1 1 0 00-1.414 1.414l2.829 2.828a1 1 0 001.414 0l4.243-4.243a1 1 0 10-1.414-1.414L8 10.586 6.707 9.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Phone
              </h3>
              <p className="text-gray-300">+62 992 5111</p>
            </div>

            {/* Work Hours (Expandable) */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-xl font-semibold text-white mb-2 focus:outline-none"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-8V6a1 1 0 10-2 0v5a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414l-2.414-2.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hours
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Current Day Hours */}
              <p className="text-blue-400 font-semibold mb-2">
                Today ({today}): {workHours[today]}
              </p>

              <div
                ref={workHoursRef}
                style={{ maxHeight }}
                className="text-gray-300 overflow-hidden transition-all duration-500"
              >
                <ul className="space-y-1">
                  {Object.entries(workHours).map(([day, hours]) => (
                    <li key={day} className={day === today ? "font-semibold text-blue-400" : ""}>
                      <span className="font-semibold">{day}:</span> {hours}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* <div className="mt-12 text-center md:text-left">
            <a
              href="mailto:info@example.com"
              className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-600 transition"
            >
              Send a Message
            </a>
          </div> */}
        </div>
      </section>

      <Testimonials />

      {/* Footer Section */}
      <footer className="bg-gray-800 py-12 text-center text-white">
        <h3 className="text-2xl font-semibold text-orange-400">Get Your First Booking!</h3>
        {/* <form className="mt-4 flex justify-center gap-2 flex-wrap">
          <input
            type="email"
            placeholder="Your Email"
            className="rounded-l-full p-3 text-white-900 min-w-[250px] border-2 border-white"
          />
          <button className="rounded-r-full bg-gray-900 px-6 py-3 font-bold hover:bg-orange-600 transition-colors">
            Sign Up
          </button>
        </form> */}
        <p className="mt-6 text-sm text-gray-400">&copy; 2026 Freedom Sports Club. All rights reserved.</p>
      </footer>
    </>
  );
}
