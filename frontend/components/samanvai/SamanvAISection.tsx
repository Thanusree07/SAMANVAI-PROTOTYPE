import { ArrowRight } from "lucide-react";

export default function SamanvAISection() {
  return (
    <section id="samanvai" className="relative overflow-hidden bg-[#f3f5fa] px-4 py-16 sm:px-6 sm:py-20">
      <div className="absolute inset-x-0 top-8 mx-auto h-[26rem] max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(64,151,255,.38),rgba(25,79,178,.18)_38%,transparent_70%)] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[1.5rem] border border-white/40 bg-[linear-gradient(145deg,rgba(0,18,52,.97)_0%,rgba(5,50,119,.96)_42%,rgba(12,92,188,.94)_72%,rgba(0,24,66,.98)_100%)] px-6 py-16 shadow-[0_30px_80px_rgba(0,27,68,.34),0_0_54px_rgba(48,141,255,.2)] backdrop-blur-2xl sm:px-12 sm:py-18 lg:px-20 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(180,225,255,.5),rgba(65,147,246,.22)_20%,transparent_42%),radial-gradient(circle_at_78%_18%,rgba(176,84,255,.18),transparent_30%),linear-gradient(115deg,rgba(255,255,255,.2),transparent_34%,rgba(255,255,255,.1)_72%,rgba(82,166,255,.16))]" aria-hidden="true" />
        <div className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" aria-hidden="true" />
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" aria-hidden="true" />
        <div className="absolute left-1/2 top-12 h-36 w-[min(74vw,720px)] -translate-x-1/2 rounded-full bg-white/14 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#5bb8ff]/14 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#1c62d0]/12 blur-3xl" aria-hidden="true" />

        <div className="absolute left-1/2 top-0 h-24 w-[min(82vw,820px)] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(0,174,255,.24),rgba(153,87,255,.18),rgba(255,255,255,.2),transparent)] blur-2xl" aria-hidden="true" />
        <div className="absolute bottom-8 left-1/2 h-16 w-[min(74vw,720px)] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(61,151,255,.2),rgba(255,255,255,.16),rgba(181,75,255,.12),transparent)] blur-2xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[.34em] text-[#ffd7a4] sm:text-sm">DIGITAL INDIA INITIATIVE</p>
          <h2 className="relative mx-auto mt-6 max-w-fit text-[3.2rem] font-black leading-none tracking-normal text-white drop-shadow-[0_22px_52px_rgba(0,0,0,.36)] sm:text-[5.4rem] lg:text-[7.4rem]">
            <span className="absolute inset-x-0 top-1/2 -z-10 mx-auto h-24 max-w-[700px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.42),rgba(84,169,255,.26)_34%,transparent_72%)] blur-2xl" aria-hidden="true" />
            SAMANVAI
          </h2>
          <p className="mt-5 text-2xl font-semibold text-white sm:text-3xl">From Need to Service</p>
          <p className="mx-auto mt-6 max-w-4xl text-lg font-medium leading-8 text-white/88 sm:text-[1.35rem] sm:leading-9">
            From every citizen&apos;s need to the right government service,<br className="hidden sm:block" />
            scheme, and application—through one intelligent platform.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="#services" className="group inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#ffb35c,#ff8a1d_48%,#e95d12)] px-8 py-4 text-sm font-black uppercase tracking-wide text-[#071d49] shadow-[0_18px_46px_rgba(255,138,29,.32),inset_0_1px_0_rgba(255,255,255,.52)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(255,138,29,.42),inset_0_1px_0_rgba(255,255,255,.62)]">
              Start with SAMANVAI
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#samanvai" className="inline-flex items-center rounded-md border border-white/35 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/18 hover:shadow-[0_18px_44px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.34)]">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
