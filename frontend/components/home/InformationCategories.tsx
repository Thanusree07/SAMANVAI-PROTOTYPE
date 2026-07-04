import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HeartPulse,
  UsersRound,
  Wheat,
} from "lucide-react";

const categories = [
  { label: "Agriculture", icon: Wheat },
  { label: "Education", icon: GraduationCap },
  { label: "Health", icon: HeartPulse },
  { label: "Governance", icon: Building2 },
  { label: "Social Welfare", icon: UsersRound },
  { label: "Employment", icon: BriefcaseBusiness },
];

export default function InformationCategories() {
  return (
    <section id="citizen-engagement" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="section-heading section-heading-center">Information Categories</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Access government information by topic, aligned with the National Portal structure.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ label, icon: Icon }) => (
            <button key={label} type="button" className="group flex min-h-[154px] flex-col items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-6 text-center shadow-[0_6px_18px_rgba(15,23,42,.055)] transition duration-300 hover:-translate-y-1 hover:border-[#0a2a6e]/25 hover:shadow-[0_14px_30px_rgba(15,23,42,.1)]">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ed1b2f]/15 bg-[#fff6f7] text-[#d7192a] transition duration-300 group-hover:bg-[#0a2a6e] group-hover:text-white">
                <Icon size={25} strokeWidth={1.7} />
              </span>
              <span className="mt-4 text-sm font-bold leading-snug text-slate-800">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button type="button" className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,.06)] transition hover:border-[#0a2a6e] hover:text-[#0a2a6e]">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
}
