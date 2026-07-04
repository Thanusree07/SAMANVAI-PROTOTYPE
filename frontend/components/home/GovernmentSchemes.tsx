import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

export default function GovernmentSchemes() {
  return (
    <section id="schemes" className="relative overflow-hidden bg-[#edf3fb] py-16 sm:py-20">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.24em] text-[#c55220]">Citizen welfare</p>
          <h2 className="mt-3 text-3xl font-bold text-[#10284f] sm:text-4xl">Government Schemes</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Discover programmes and benefits designed for citizens across every stage of life.</p>
        </div>
        <div className="mt-10 grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_55px_rgba(15,45,90,.12)] md:grid-cols-2">
          <article className="border-b border-slate-200 p-8 md:border-b-0 md:border-r sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7eef9] text-[#0b2d62]"><Search size={22} /></span>
            <h3 className="mt-6 text-2xl font-bold text-[#10284f]">Search Schemes</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Browse central and state schemes by category, ministry or benefit.</p>
            <div className="mt-6 flex overflow-hidden rounded-md border border-slate-300">
              <input type="search" aria-label="Search government schemes" placeholder="Search by scheme name" className="h-12 min-w-0 flex-1 px-4 text-sm outline-none" />
              <button type="button" aria-label="Search schemes" className="bg-[#d83232] px-5 text-white"><ArrowRight size={19} /></button>
            </div>
          </article>
          <article className="relative overflow-hidden bg-[#0b2d62] p-8 text-white sm:p-10">
            <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border-[34px] border-white/5" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/12 text-[#ffb65c] ring-1 ring-white/15"><SlidersHorizontal size={22} /></span>
            <p className="relative mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#ffb65c]">Personalised discovery</p>
            <h3 className="relative mt-2 text-2xl font-bold">Find schemes made for you</h3>
            <p className="relative mt-3 max-w-md text-sm leading-6 text-white/70">Answer a few simple questions to identify programmes suited to your eligibility and needs.</p>
            <button type="button" className="relative mt-7 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#0b2d62] transition hover:bg-[#fff4e7]">Check your eligibility</button>
          </article>
        </div>
      </div>
    </section>
  );
}
