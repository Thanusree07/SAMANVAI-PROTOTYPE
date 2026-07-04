import TopStrip from "@/components/layout/TopStrip";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import OnlineServices from "@/components/home/OnlineServices";
import InformationCategories from "@/components/home/InformationCategories";
import NewsSection from "@/components/home/NewsSection";

import SamanvAISection from "@/components/samanvai/SamanvAISection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <TopStrip />
      <Header />
      <Navbar />

      <Hero />
      <Stats />
      <OnlineServices />
      <InformationCategories />
      <SamanvAISection />
      <NewsSection />

      <Footer />
    </main>
  );
}
