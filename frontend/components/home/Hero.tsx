
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, MessageSquare, Palette, Search, Share2, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

const heroSlides = [
  { src: "/images/hero/Hero3.jpg", position: "50% center" },
  { src: "/images/hero/Hero2.webp", position: "50% center" },
  { src: "/images/hero/Hero1.webp", position: "50% center" },
];
const categories = ["All Categories", "Acts", "Citizen Engagements", "Directory", "Explore India", "News", "Schemes", "Services"];
const trendingSearches = ["Apply Aadhaar", "DigiLocker", "New Voter Registration", "Tatkaal Passport Service", "Apply for Driving Licence"];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentSlide((value) => (value + 1) % heroSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
  id="main-content"
  className="relative isolate min-h-[85vh] overflow-hidden"
>
      {heroSlides.map((slide, index) => (
        <div
          key={slide.src}
          className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${slide.src})`,
            backgroundPosition: slide.position,
            opacity: index === currentSlide ? 1 : 0,
          }}
          aria-hidden="true"
        />
      ))}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(2,8,28,.72)_0%,rgba(2,8,28,.5)_24%,rgba(2,27,82,.2)_46%,transparent_68%),linear-gradient(90deg,rgba(2,27,82,.78),rgba(41,31,96,.52)_48%,rgba(15,61,124,.64)),linear-gradient(180deg,rgba(2,8,28,.18),rgba(31,19,70,.68))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-10px)] max-w-[1440px] flex-col items-center justify-center px-4 pb-28 pt-8 text-center sm:px-6 lg:pb-32 lg:pt-28">
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center justify-center text-center">
          <Image
            src="/images/image.png"
            alt="india.gov.in - National Portal of India"
            width={851}
            height={547}
            priority
            className="mx-auto h-auto w-[min(56vw,430px)] -translate-x-2 object-contain drop-shadow-[0_18px_42px_rgba(0,0,0,.34)] sm:w-[min(58vw,520px)] sm:-translate-x-3 lg:w-[470px] lg:-translate-x-4"
          />
          <p className="mt-5 text-xl font-medium text-white sm:text-[1.65rem]">Where Government Information Converges</p>

          <div className="mx-auto mt-8 flex w-full max-w-[900px] flex-col overflow-hidden rounded-md bg-white/95 shadow-[0_16px_46px_rgba(0,0,0,.26)] ring-1 ring-white/35 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-4 px-5">
              <Search size={27} className="shrink-0 text-slate-500" />
              <label htmlFor="hero-search" className="sr-only">Search India Portal</label>
              <input id="hero-search" type="search" placeholder="Search for" className="h-[48px] w-full bg-transparent text-lg text-slate-800 outline-none placeholder:text-slate-400 sm:h-[72px] sm:text-xl" />
            </div>
            <div className="relative border-t border-slate-300 bg-white sm:border-l sm:border-t-0">
              <label htmlFor="hero-category" className="sr-only">Search category</label>
              <select id="hero-category" defaultValue="All Categories" className="h-[56px] w-full appearance-none bg-white pl-5 pr-12 text-lg text-slate-600 outline-none sm:h-[72px] sm:w-[220px] sm:text-xl">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <ChevronDown size={20} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-700" />
            </div>
                          <button
               onClick={() => {
  console.log("clicked");
  router.push("/dashboard");
}}>
</button>
          </div>


          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <span className="mr-1 text-xl font-bold text-white">Trending Searches :</span>
            {trendingSearches.map((term) => (
              <button key={term} type="button" className="rounded border border-white/35 bg-white/5 px-4 py-2.5 text-lg font-medium text-white backdrop-blur-sm transition hover:border-white/65 hover:bg-white/12">
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-28 right-5 hidden flex-col overflow-hidden rounded-lg bg-[#071d49]/65 shadow-[0_18px_50px_rgba(0,0,0,.2)] backdrop-blur-sm lg:flex">
          {[MessageSquare, CalendarDays, Share2, Palette].map((Icon, index) => (
            <button key={index} type="button" aria-label={`Quick tool ${index + 1}`} className="flex h-14 w-14 items-center justify-center border-b border-white/10 p-4 text-white transition hover:bg-white/14">
              <Icon size={22} strokeWidth={1.9} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
