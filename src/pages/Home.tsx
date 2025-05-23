
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import UniqueUseCases from "@/components/UniqueUseCases";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <CategoryCard
                name="Electronics"
                icon="laptop"
                slug="electronics"
              />
              <CategoryCard
                name="Tools"
                icon="wrench"
                slug="tools"
              />
              <CategoryCard
                name="Sports"
                icon="dumbbell"
                slug="sports"
              />
              <CategoryCard
                name="Vehicles"
                icon="car"
                slug="vehicles"
              />
              <CategoryCard
                name="Events"
                icon="calendar"
                slug="events"
              />
              <CategoryCard
                name="Services"
                icon="users"
                slug="services"
              />
            </div>
          </section>
          <UniqueUseCases />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
