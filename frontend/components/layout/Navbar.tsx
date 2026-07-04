export default function Navbar() {
  const items = [
    "Home",
    "Services",
    "Schemes",
    "Documents",
    "Departments",
    "Contact",
  ];

  return (
    <nav className="bg-[#0B4EA2] text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 h-14">
        {items.map((item) => (
          <button
            key={item}
            className="text-sm font-medium hover:text-yellow-300 transition"
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}