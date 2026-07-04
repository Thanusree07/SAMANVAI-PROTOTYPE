import { Globe, Accessibility, Menu, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-24 flex items-center justify-between px-6">

        {/* Logo Placeholder */}
        <div className="w-[220px] h-[60px] border rounded-md bg-gray-100 flex items-center justify-center font-semibold text-gray-500">
          INDIA.GOV LOGO
        </div>

        {/* Search Area */}
        <div className="flex items-center gap-3">

          <input
            type="text"
            placeholder="Search..."
            className="w-72 px-4 py-2 border rounded-md outline-none"
          />

          <select className="px-3 py-2 border rounded-md">
            <option>All Categories</option>
          </select>

          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <Search size={18} />
            Search
          </button>

          <Globe size={22} className="text-gray-600 cursor-pointer" />
          <Accessibility size={22} className="text-gray-600 cursor-pointer" />
          <Menu size={24} className="text-gray-600 cursor-pointer" />

        </div>

      </div>
    </header>
  );
}