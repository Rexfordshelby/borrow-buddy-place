
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import UniqueUseCases from "@/components/UniqueUseCases";
import { Laptop, Wrench, Dumbbell, Car, Calendar, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <CategoryCard
                title="Electronics"
                icon={<Laptop className="h-8 w-8" />}
                itemCount={125}
                slug="electronics"
              />
              <CategoryCard
                title="Tools"
                icon={<Wrench className="h-8 w-8" />}
                itemCount={89}
                slug="tools"
              />
              <CategoryCard
                title="Sports"
                icon={<Dumbbell className="h-8 w-8" />}
                itemCount={76}
                slug="sports"
              />
              <CategoryCard
                title="Vehicles"
                icon={<Car className="h-8 w-8" />}
                itemCount={42}
                slug="vehicles"
              />
              <CategoryCard
                title="Events"
                icon={<Calendar className="h-8 w-8" />}
                itemCount={38}
                slug="events"
              />
              <CategoryCard
                title="Services"
                icon={<Users className="h-8 w-8" />}
                itemCount={67}
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
