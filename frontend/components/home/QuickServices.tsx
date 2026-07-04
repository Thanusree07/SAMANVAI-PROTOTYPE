import {
  FileText,
  Landmark,
  GraduationCap,
  HeartPulse,
} from "lucide-react";

const services = [
  {
    title: "Documents",
    icon: FileText,
    desc: "Apply and manage official documents",
  },
  {
    title: "Government Schemes",
    icon: Landmark,
    desc: "Explore central & state schemes",
  },
  {
    title: "Education",
    icon: GraduationCap,
    desc: "Scholarships and education services",
  },
  {
    title: "Healthcare",
    icon: HeartPulse,
    desc: "Health and wellness initiatives",
  },
];

export default function QuickServices() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800">
          Quick Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <Icon size={40} className="text-red-600 mb-4" />
                <h3 className="text-xl font-semibold">
                  {service.title}
                </h3>
                <p className="text-gray-500 mt-2">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
