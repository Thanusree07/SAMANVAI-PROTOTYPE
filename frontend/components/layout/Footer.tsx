import Image from "next/image";

const links = ["About India Portal", "Accessibility", "Copyright Policy", "Help", "Privacy Policy", "Terms of Use", "Contact Us"];

export default function Footer() {
  return (
    <footer className="bg-[#071d49] text-white">
      <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
      <div className="mx-auto max-w-[1585px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <Image src="/images/image.png" alt="National Portal of India" width={851} height={515} className="h-auto w-[220px] object-contain object-left" />
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/65">
              India Portal provides citizens with open and easy access to information, public services and government initiatives.
            </p>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-white/45">
              Designed, developed and maintained by the National Informatics Centre, Ministry of Electronics & Information Technology, Government of India.
            </p>
          </div>
          <div className="lg:text-right">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">Follow the National Portal</p>
            <div className="mt-4 flex gap-2 lg:justify-end">
              {["f", "X", "YT", "IG", "in"].map((mark, index) => (
                <button key={mark} type="button" aria-label={`Social media link ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-white/70 transition hover:border-[#ffb65c] hover:text-[#ffb65c]">
                  {mark}
                </button>
              ))}
            </div>
            <a href="#samanvai" className="mt-7 inline-block text-sm font-bold text-[#ffb65c] hover:text-white">
              SAMANVAI - From Need to Service
            </a>
          </div>
        </div>
        <nav aria-label="Footer links" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/12 pt-6">
          {links.map((link) => (
            <a key={link} href="#main-content" className="text-xs text-white/60 transition hover:text-white">
              {link}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 bg-[#051636]">
        <div className="mx-auto flex max-w-[1585px] flex-col justify-between gap-2 px-4 py-4 text-[11px] text-white/45 sm:flex-row sm:px-6">
          <p>(c) {new Date().getFullYear()} National Portal of India - SAMANVAI Prototype</p>
          <p>Last reviewed and updated: 04 July 2026</p>
        </div>
      </div>
    </footer>
  );
}
