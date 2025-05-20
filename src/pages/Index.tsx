
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Users, Award, Clock, ArrowRight, Search, Calendar, MapPin } from "lucide-react";
import { categories, items } from "@/data/mock-data";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Popular Categories</h2>
                <p className="text-gray-600">Browse items by category</p>
              </div>
              <Button variant="ghost" className="hidden md:flex items-center mt-4 md:mt-0">
                View all categories <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon}
                  title={category.title}
                  itemCount={category.itemCount}
                  slug={category.slug}
                />
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Button variant="outline">View all categories</Button>
            </div>
          </div>
        </section>

        {/* Featured Items Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Items</h2>
                <p className="text-gray-600">Discover what people are renting right now</p>
              </div>
              <Button variant="ghost" className="hidden md:flex items-center mt-4 md:mt-0">
                View all items <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  priceUnit={item.priceUnit}
                  imageUrl={item.imageUrl}
                  location={item.location}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  category={item.category}
                  isVerified={item.isVerified}
                />
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Button variant="outline">View all items</Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              BorrowBuddy makes it easy to rent items from people in your community
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-brand-100 flex items-center justify-center rounded-full mx-auto mb-4">
                  <Search className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Find What You Need</h3>
                <p className="text-gray-600">
                  Browse thousands of items available to rent in your local area
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-brand-100 flex items-center justify-center rounded-full mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Book With Confidence</h3>
                <p className="text-gray-600">
                  Request the item for your chosen dates and make secure payment
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-brand-100 flex items-center justify-center rounded-full mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Pick Up & Enjoy</h3>
                <p className="text-gray-600">
                  Meet the owner to collect the item and return it when you're done
                </p>
              </div>
            </div>

            <div className="mt-12">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                Start Renting
              </Button>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
              <div className="md:w-1/2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Your Trust & Safety Is Our Priority
                </h2>
                <p className="text-gray-600 mb-6">
                  We've built BorrowBuddy with trust and safety at its core. Our verification
                  process, secure payments, and insurance options ensure peace of mind for both
                  borrowers and lenders.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Users className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold mb-1">Verified Users</h3>
                      <p className="text-sm text-gray-600">
                        All users go through our verification process to confirm their identity
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Award className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold mb-1">Safe Payments</h3>
                      <p className="text-sm text-gray-600">
                        Secure payment processing and damage deposits to protect your items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Star className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold mb-1">Review System</h3>
                      <p className="text-sm text-gray-600">
                        Transparent reviews and ratings help you make informed decisions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold mb-1">24/7 Support</h3>
                      <p className="text-sm text-gray-600">
                        Our support team is available around the clock to assist with any issues
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button>Learn More About Safety</Button>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="relative">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&auto=format&fit=crop&q=80"
                      alt="People exchanging rented item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src="https://randomuser.me/api/portraits/women/44.jpg"
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        </div>
                        <p className="text-sm mt-1">
                          "Renting was super easy and the item was in perfect condition!"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to start renting?
            </h2>
            <p className="text-brand-50 max-w-xl mx-auto mb-8">
              Join thousands of people who are already saving money and reducing waste by
              renting instead of buying.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Browse Items
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-brand-600">
                List Your Item
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
