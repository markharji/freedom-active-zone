import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
          <div className="w-64 rounded-lg bg-white shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Basketball Courts</h3>
            <p className="text-gray-600">Premium indoor and outdoor courts designed for competitive and casual play.</p>
          </div>
          <div className="w-64 rounded-lg bg-white shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pickleball</h3>
            <p className="text-gray-600">
              Enjoy our modern pickleball courts with professional-grade flooring and nets.
            </p>
          </div>
          <div className="w-64 rounded-lg bg-white shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fitness & Training</h3>
            <p className="text-gray-600">
              Train with certified coaches and fitness trainers in a supportive environment.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="apparel" className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Apparel & Merchandise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg", "/img5.jpg", "/img6.jpg"].map((src, i) => (
            <div
              key={i}
              className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
            >
              <Image src={src} alt={`Merchandise ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      {/* <section id="contact" className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
          <p className="text-orange-400 mb-8">Have questions or want to book a court? Send us a message!</p>
          <form className="grid gap-4">
            <input type="text" placeholder="Your Name" className="w-full rounded-md border-none p-3 text-gray-900" />
            <input type="email" placeholder="Your Email" className="w-full rounded-md border-none p-3 text-gray-900" />
            <textarea placeholder="Your Message" className="w-full rounded-md border-none p-3 text-gray-900" rows={4} />
            <button className="rounded-full bg-orange-500 py-3 font-bold uppercase tracking-wide hover:bg-orange-600 transition-colors">
              Send Message
            </button>
          </form>
          <div className="mt-8 text-gray-300">
            <p>Freedom Sports Club</p>
            <p>Zamboanga City, Philippines</p>
            <p>+63 992 5111</p>
          </div>
        </div>
      </section> */}

      {/* Footer Section */}
      <footer className="bg-gray-800 py-12 text-center text-white">
        <h3 className="text-2xl font-semibold text-orange-400">Get 10% Off Your First Booking!</h3>
        <form className="mt-4 flex justify-center gap-2 flex-wrap">
          <input
            type="email"
            placeholder="Your Email"
            className="rounded-l-full p-3 text-white-900 min-w-[250px] border-2 border-white"
          />
          <button className="rounded-r-full bg-gray-900 px-6 py-3 font-bold hover:bg-orange-600 transition-colors">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-400">&copy; 2026 Freedom Sports Club. All rights reserved.</p>
      </footer>
    </>
  );
}
