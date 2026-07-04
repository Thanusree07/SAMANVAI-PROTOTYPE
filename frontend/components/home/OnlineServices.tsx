"use client";

import Image from "next/image";
import { Building2, ChevronLeft, ChevronRight, ClipboardList, Landmark, Settings } from "lucide-react";
import { useState } from "react";

const services = [
  {
    title: "Online textbooks of National Council of Educational Research and Training",
    image: "/images/hero/Hero2.webp",
  },
  {
    title: "Interact with Hon'ble Prime Minister of India",
    image: "/images/hero/Hero1.webp",
  },
  {
    title: "National Career Service for Job Seekers and Employers",
    image: "/images/hero/Hero3.jpg",
  },
  {
    title: "DigiLocker - Access Documents Anywhere, Anytime",
    image: "/images/hero/Hero1.webp",
  },
];

const counts = [
  { value: "1120+", label: "Central Govt.", icon: Landmark },
  { value: "12493+", label: "State Govt.", icon: Building2 },
  { value: "33", label: "Imp. Services", icon: Settings },
  { value: "18", label: "Category", icon: ClipboardList },
];

export default function OnlineServices() {
  const [activeIndex, setActiveIndex] = useState(0);
  const visible = Array.from({ length: 3 }, (_, i) => services[(activeIndex + i) % services.length]);

  return (
    <section id="services" className="bg-[#f3f5fa] pb-16">
      <div className="mx-auto max-w-[1585px] px-4 sm:px-6">
        <div className="grid overflow-hidden bg-white shadow-[0_8px_24px_rgba(15,23,42,.1)] lg:grid-cols-[.98fr_.92fr]">
          <div className="bg-[#ed1b2f] px-8 py-10 text-white sm:px-12 lg:px-[50px]">
            <h2 className="inline-block border-b-4 border-white pb-2 text-[2.35rem] font-black leading-tight sm:text-[3rem]">
              Online Services
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {counts.map(({ value, label, icon: Icon }) => (
                <article key={label} className="flex min-h-[188px] flex-col items-center justify-center rounded-md border border-white/70 bg-white/[.06] px-4 text-center transition duration-300 hover:-translate-y-1 hover:bg-white/[.1]">
                  <Icon size={43} strokeWidth={1.7} />
                  <p className="mt-6 text-[2rem] font-black leading-none">{value}</p>
                  <p className="mt-3 text-lg font-bold uppercase leading-tight">{label}</p>
                </article>
              ))}
            </div>
            <button type="button" className="mt-10 rounded-full bg-white px-9 py-3 text-sm font-bold uppercase tracking-wide text-[#ed1b2f] transition hover:bg-[#fff4f5]">
              View All Services
            </button>
          </div>

          <div className="relative px-8 py-10 sm:px-10 lg:py-[76px]">
            <div className="grid gap-5 md:grid-cols-3">
              {visible.map((service) => (
                <article key={service.title} className="group overflow-hidden rounded-lg bg-white shadow-[0_10px_24px_rgba(15,23,42,.15)] ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,.2)]">
                  <div className="relative aspect-[1.55/1] overflow-hidden">
                    <Image src={service.image} alt="" fill sizes="(max-width: 768px) 100vw, 22vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-3 text-xl font-bold leading-snug text-[#263142] md:text-[1.25rem]">{service.title}</h3>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setActiveIndex((i) => (i === 0 ? services.length - 1 : i - 1))} aria-label="Previous services" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[#ed1b2f] hover:text-[#ed1b2f]">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => setActiveIndex((i) => (i === services.length - 1 ? 0 : i + 1))} aria-label="Next services" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[#ed1b2f] hover:text-[#ed1b2f]">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
