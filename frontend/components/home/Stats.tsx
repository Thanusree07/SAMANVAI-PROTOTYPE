import { BadgeCheck, FileStack, Handshake, MapPinned, Network, Trophy } from "lucide-react";

const stats = [
  { value: "13751", label: "Online Services", icon: Handshake },
  { value: "5456", label: "Govt. Schemes", icon: FileStack },
  { value: "8834", label: "Citizen Engagements", icon: Network },
  { value: "3897", label: "Tourist Places", icon: MapPinned },
  { value: "1207", label: "ODOP Products", icon: Trophy },
  { value: "18", label: "Information Categories", icon: BadgeCheck },
];

export default function Stats() {
  return (
    <section className="relative z-20 -mt-20 bg-[#f3f5fa] px-4 pb-16 sm:-mt-[86px] sm:px-6">
      <div className="mx-auto max-w-[1585px] rounded-lg bg-white px-5 py-8 shadow-[0_10px_24px_rgba(15,23,42,.18)] sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="group flex items-center justify-center gap-4 text-left">
              <Icon size={54} strokeWidth={1.7} className="shrink-0 text-[#ff1f3a] transition-transform duration-300 group-hover:-translate-y-1" />
              <div>
                <p className="text-[2.15rem] font-black leading-none text-black">{value}</p>
                <p className="mt-2 max-w-[150px] text-[1.45rem] font-medium leading-tight text-[#3f3f46] lg:text-[1.35rem]">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
