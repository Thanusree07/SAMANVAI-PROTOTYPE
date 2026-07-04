export default function Hero() {
  return (
    <section
      className="relative h-[550px] bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/hero/hero-bg.jpg')",
      }}
    >
      {/* Dark Transparent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/85 via-[#003b73]/70 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-8">
        <div className="max-w-xl text-white">
          <p className="text-yellow-300 font-semibold mb-3">
            National Portal of India
          </p>

          <h1 className="text-6xl font-bold leading-tight">
            Government
            <br />
            Services
          </h1>

          <p className="mt-6 text-lg text-gray-200 leading-8">
            Access government services, schemes, citizen resources and
            public information through one unified digital platform.
          </p>

          <button className="mt-8 bg-red-600 hover:bg-red-700 transition px-7 py-3 rounded-lg font-semibold">
            Explore Services
          </button>
        </div>
      </div>
    </section>
  );
}