"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";

SwiperCore.use([Autoplay, Pagination]);

interface Testimony {
  id: number;
  name: string;
  role: string;
  message: string;
}

const testimonies: Testimony[] = [
  {
    id: 1,
    name: "Carlos Reyes",
    role: "Basketball Player",
    message:
      "I really enjoy Freedom Sports Club. The courts are excellent and the environment is very friendly for all players.",
  },
  {
    id: 2,
    name: "Ana Lopez",
    role: "Pickleball Enthusiast",
    message:
      "Ang mga pickleball courts dito ay modern at malinis. Perfect para maglaro at mag-practice kasama ang mga kaibigan.",
  },
  {
    id: 3,
    name: "Rafael Santos",
    role: "Fitness Trainer",
    message:
      "The club has so much energy, and the staff are very helpful. I highly recommend Freedom Sports Club to anyone who loves sports.",
  },
  {
    id: 4,
    name: "Maricel Villanueva",
    role: "Amateur Athlete",
    message:
      "Masaya ako tuwing naglalaro dito. Kumpleto ang Freedom Sports Club sa mga kailangan ko para mag-training at mag-improve.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-6 bg-gray-50 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Members Say</h2>
      <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
        Hear from our community about their experiences training, playing, and connecting at Freedom Sports Club.
      </p>

      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {testimonies.map((t) => (
          <SwiperSlide key={t.id}>
            <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-center items-center transition-transform hover:scale-105">
              <p className="text-gray-200 mb-6 text-center italic">"{t.message}"</p>
              <h4 className="text-lg font-semibold">{t.name}</h4>
              <span className="text-sm text-gray-400">{t.role}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
