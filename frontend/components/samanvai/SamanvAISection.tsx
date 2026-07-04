import { ArrowRight } from "lucide-react";

export default function SamanvAISection() {
  return (
    <section id="samanvai" className="relative bg-[#f3f5fa] px-4 py-24 sm:px-6 sm:py-28">
      <div className="absolute inset-x-0 top-20 mx-auto h-72 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(30,107,193,.28),rgba(10,61,145,.14)_42%,transparent_72%)] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-2xl border border-white/55 bg-[linear-gradient(135deg,rgba(1,24,70,.94)_0%,rgba(7,54,131,.9)_45%,rgba(29,106,197,.86)_100%)] px-6 py-20 shadow-[0_34px_90px_rgba(10,42,110,.34)] backdrop-blur-2xl sm:px-12 sm:py-24 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,.26),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(111,181,255,.24),transparent_32%),linear-gradient(120deg,rgba(255,255,255,.18),transparent_45%,rgba(19,136,8,.1))]" aria-hidden="true" />
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8ec5ff]/70 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[.32em] text-[#ffd29a] sm:text-sm">Digital India Initiative</p>
          <h2 className="mt-6 text-[3.9rem] font-black leading-none tracking-normal text-white drop-shadow-[0_20px_46px_rgba(0,0,0,.32)] sm:text-[6rem] lg:text-[7.6rem]">
            SAMANVAI
          </h2>
          <p className="mx-auto mt-8 max-w-4xl text-lg font-medium leading-8 text-white/88 sm:text-2xl sm:leading-10">
            From every citizen&apos;s need to the right government service,<br className="hidden sm:block" />
            scheme, and application—through one intelligent platform.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a href="#services" className="group inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 text-sm font-black uppercase tracking-wide text-[#0a2a6e] shadow-[0_18px_44px_rgba(0,0,0,.2)] transition duration-300 hover:-translate-y-1 hover:bg-[#fff6ed]">
              Start with SAMANVAI
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#samanvai" className="inline-flex items-center rounded-md border border-white/45 bg-white/12 px-8 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,.28)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
