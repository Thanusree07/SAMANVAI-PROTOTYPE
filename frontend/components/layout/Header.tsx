"use client";

import Image from "next/image";
import Link from "next/link";
import { Accessibility, CalendarDays, ChevronDown, Languages, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";

const categories = ["All Categories", "Acts", "Citizen Engagements", "Directory", "Explore India", "News", "Schemes", "Services"];

function FlagMark() {
  return (
    <span className="inline-flex h-8 w-14 flex-col overflow-hidden" aria-hidden="true">
      <span className="h-1.5 bg-[#ff5f2f]" />
      <span className="h-1.5 bg-white" />
      <span className="h-1.5 bg-[#138808]" />
    </span>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setInterval(onScroll, 150);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-999 transition-all duration-500 ${
        scrolled
  ? "border-b border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,.12)]"
  : "bg-transparent text-white"
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded bg-white px-4 py-2 text-[#071d49]">
        Skip to main content
      </a>
      <div className="top-tricolor h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] opacity-0 transition-opacity duration-500 data-[visible=true]:opacity-100" data-visible={scrolled} />
      <div className="mx-auto flex min-h-[84px] max-w-[1740px] items-center justify-between gap-5 px-4 transition-all duration-500 sm:px-8 lg:px-14">
        <Link
  href="/"
  aria-label="National Portal of India home"
  className={`scroll-reveal shrink-0 transition-all duration-500 ${
    scrolled ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
  }`}
>
  <Image
    src="/images/image.png"
    alt="india.gov.in - National Portal of India"
    width={851}
    height={547}
    priority
    className="h-auto w-[172px] object-contain drop-shadow-[0_2px_8px_rgba(15,23,42,.12)] lg:w-[190px]"
  />
</Link>

        <div
          className={`scroll-reveal header-search-wrap hidden flex-1 justify-center transition-all duration-500 lg:flex ${
            scrolled ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="flex w-full max-w-[720px] overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
            <div className="flex min-w-0 flex-1 items-center gap-4 px-5">
              <Search size={21} className="shrink-0 text-slate-500" />
              <label htmlFor="header-search" className="sr-only">Search</label>
              <input id="header-search" type="search" placeholder="Search Here" className="h-[54px] w-full bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400" />
            </div>
            <div className="relative border-l border-slate-300 bg-white">
              <label htmlFor="header-category" className="sr-only">Category</label>
              <select id="header-category" defaultValue="All Categories" className="h-[54px] w-[180px] appearance-none bg-white pl-4 pr-10 text-base font-semibold text-slate-600 outline-none">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" />
            </div>
            <button type="button" className="h-[54px] bg-[#ed1b2f] px-8 text-lg font-bold text-white transition hover:bg-[#cf1626]">
              Search
            </button>
          </div>
        </div>

        <div className={`header-controls ml-auto flex items-center gap-4 text-sm font-medium sm:text-base ${scrolled ? "text-slate-950" : "text-white"}`}>
          <a href="#main-content" className="hidden whitespace-nowrap transition hover:text-[#ff9933] md:inline">
            Skip to main content
          </a>
          <span className={`hidden h-8 w-px md:block ${scrolled ? "bg-slate-500" : "bg-white/80"}`} aria-hidden="true" />
          <button type="button" aria-label="Calendar" className="header-icon"><CalendarDays size={26} strokeWidth={1.8} /></button>
          <span className={`hidden h-8 w-px sm:block ${scrolled ? "bg-slate-500" : "bg-white/80"}`} aria-hidden="true" />
          <button type="button" aria-label="Accessibility tools" className="header-icon"><Accessibility size={27} strokeWidth={1.8} /></button>
          <span className={`hidden h-8 w-px sm:block ${scrolled ? "bg-slate-500" : "bg-white/80"}`} aria-hidden="true" />
          <button type="button" aria-label="Select language" className="header-icon"><Languages size={27} strokeWidth={1.8} /></button>
          <span className={`hidden h-8 w-px sm:block ${scrolled ? "bg-slate-500" : "bg-white/80"}`} aria-hidden="true" />
          <button type="button" aria-label="Menu" className="header-icon">
            {scrolled ? <FlagMark /> : <Menu size={40} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
    </header>
  );
}
