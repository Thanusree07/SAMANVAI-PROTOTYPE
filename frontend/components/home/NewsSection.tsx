import Image from "next/image";

const newsSources = [
  { name: "Press Information Bureau", abbr: "PIB", tone: "bg-[#0a2a6e]" },
  { name: "Doordarshan News", abbr: "DD", tone: "bg-[#ed1b2f]" },
  { name: "News on Air", abbr: "AIR", tone: "bg-[#138808]" },
];

const spotlightItems = [
  {
    month: "July 2026",
    title: "Pradhan Mantri Anusuchit Jaati Abhyuday Yojana",
    image: "/images/hero/Hero1.webp",
  },
  {
    month: "June 2026",
    title: "Gyan Bharatam Mission",
    image: "/images/hero/Hero2.webp",
  },
  {
    month: "May 2026",
    title: "Census of India 2027",
    image: "/images/hero/Hero3.jpg",
  },
];

export default function NewsSection() {
  return (
    <section id="news" className="bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fc_100%)] py-20 sm:py-24">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
          <div>
            <h2 className="section-heading">News / Press Release</h2>
            <p className="mt-6 text-base text-slate-500">Your gateway to authentic Government of India news.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {newsSources.map((source) => (
                <article key={source.name} className="group flex items-center gap-5 rounded-md border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,.06)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#0a2a6e]/20 hover:shadow-[0_16px_36px_rgba(15,23,42,.11)]">
                  <div className={`flex h-20 w-24 shrink-0 items-center justify-center rounded-md ${source.tone} text-xl font-black tracking-wider text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22)]`}>
                    {source.abbr}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{source.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Latest official updates</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="section-heading">Spotlight</h2>
            <p className="mt-6 text-base text-slate-500">Stories from the core of our nation.</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {spotlightItems.map((item) => (
                <article key={item.title} className="group overflow-hidden rounded-md border border-white/80 bg-white/88 shadow-[0_12px_34px_rgba(15,23,42,.09)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_48px_rgba(15,23,42,.14)]">
                  <div className="relative aspect-[1.35/1] overflow-hidden">
                    <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-[.18em] text-[#ed1b2f]">{item.month}</p>
                    <h3 className="mt-3 text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#0a2a6e]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      Explore key national initiatives and updates through a clean, citizen-focused view.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
