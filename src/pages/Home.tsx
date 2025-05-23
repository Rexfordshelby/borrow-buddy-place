
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import UniqueUseCases from "@/components/UniqueUseCases";
import { Laptop, Wrench, Dumbbell, Car, Calendar, Users, Star, Shield, Clock, MapPin } from "lucide-react";

const Home = () => {
  const categories = [
    {
      title: "Electronics",
      icon: <Laptop className="h-8 w-8" />,
      itemCount: 125,
      slug: "electronics",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Tools",
      icon: <Wrench className="h-8 w-8" />,
      itemCount: 89,
      slug: "tools",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Sports",
      icon: <Dumbbell className="h-8 w-8" />,
      itemCount: 76,
      slug: "sports",
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Vehicles",
      icon: <Car className="h-8 w-8" />,
      itemCount: 42,
      slug: "vehicles",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      title: "Events",
      icon: <Calendar className="h-8 w-8" />,
      itemCount: 38,
      slug: "events",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      title: "Services",
      icon: <Users className="h-8 w-8" />,
      itemCount: 67,
      slug: "services",
      gradient: "from-purple-500 to-indigo-600"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        
        {/* Enhanced Categories Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                Explore Categories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover thousands of items and services available for rent in your area
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.slug}
                  title={category.title}
                  icon={category.icon}
                  itemCount={category.itemCount}
                  slug={category.slug}
                  gradient={category.gradient}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why Choose Us?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Your safety and satisfaction are our top priorities
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-colors">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Verified Users</h3>
                <p className="text-blue-100">All users are verified for your peace of mind and security</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-colors">
                  <Star className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Quality Guaranteed</h3>
                <p className="text-blue-100">Every item is reviewed and rated by our community</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-colors">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">24/7 Support</h3>
                <p className="text-blue-100">Round-the-clock customer support for any assistance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-400">Happy Users</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-gray-400">Items Available</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-gray-400">Cities Covered</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.8★</div>
                <div className="text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        <UniqueUseCases />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
