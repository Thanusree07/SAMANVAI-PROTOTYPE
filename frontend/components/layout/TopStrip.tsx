export default function TopStrip() {
  return (
    <div className="bg-[#0B3D91] text-white text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇮🇳</span>
          <span className="font-medium">Government of India</span>
        </div>

        <div className="flex gap-4">
          <button>English</button>
          <button>తెలుగు</button>
          <button>हिन्दी</button>
        </div>
      </div>
    </div>
  );
}
