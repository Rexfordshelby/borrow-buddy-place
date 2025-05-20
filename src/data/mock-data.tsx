
import { Camera, Cpu, Tool, Car, Shirt, Home, Plane, Globe, Bike, Headphones } from "lucide-react";

// Categories data
export const categories = [
  {
    id: "electronics",
    title: "Electronics",
    slug: "electronics",
    icon: <Cpu className="w-8 h-8" />,
    itemCount: 152
  },
  {
    id: "tools",
    title: "Tools & DIY",
    slug: "tools",
    icon: <Tool className="w-8 h-8" />,
    itemCount: 98
  },
  {
    id: "vehicles",
    title: "Vehicles",
    slug: "vehicles",
    icon: <Car className="w-8 h-8" />,
    itemCount: 45
  },
  {
    id: "clothing",
    title: "Clothing",
    slug: "clothing",
    icon: <Shirt className="w-8 h-8" />,
    itemCount: 73
  },
  {
    id: "home",
    title: "Home & Garden",
    slug: "home",
    icon: <Home className="w-8 h-8" />,
    itemCount: 86
  },
  {
    id: "travel",
    title: "Travel Gear",
    slug: "travel",
    icon: <Plane className="w-8 h-8" />,
    itemCount: 62
  },
  {
    id: "outdoors",
    title: "Outdoor Gear",
    slug: "outdoors",
    icon: <Globe className="w-8 h-8" />,
    itemCount: 91
  },
  {
    id: "sports",
    title: "Sports Equipment",
    slug: "sports",
    icon: <Bike className="w-8 h-8" />,
    itemCount: 77
  },
];

// Items data
export const items = [
  {
    id: "1",
    title: "Sony A7III Camera with Lens Kit",
    price: 45,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 28,
    category: "Electronics",
    isVerified: true,
    description: "Professional Sony A7III mirrorless camera with 24-70mm lens, extra battery, and 64GB SD card.",
    owner: {
      name: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.9,
      responseTime: "Within 1 hour"
    }
  },
  {
    id: "2",
    title: "DJI Mavic Air 2 Drone",
    price: 35,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&auto=format&fit=crop&q=80",
    location: "Los Angeles, CA",
    rating: 4.7,
    reviewCount: 19,
    category: "Electronics",
    isVerified: true,
    description: "DJI Mavic Air 2 drone with 3 batteries, controller, and carrying case. 4K video recording capability.",
    owner: {
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.8,
      responseTime: "Within 2 hours"
    }
  },
  {
    id: "3",
    title: "Dewalt Power Tool Set",
    price: 25,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1540104539488-92a51bbc0410?w=600&auto=format&fit=crop&q=80",
    location: "Chicago, IL",
    rating: 4.5,
    reviewCount: 32,
    category: "Tools",
    isVerified: false,
    description: "Complete Dewalt power tool set including drill, circular saw, impact driver, and reciprocating saw. All with batteries and chargers.",
    owner: {
      name: "Robert Smith",
      avatar: "https://randomuser.me/api/portraits/men/57.jpg",
      rating: 4.6,
      responseTime: "Within 1 day"
    }
  },
  {
    id: "4",
    title: "Mountain Bike - Trek Fuel EX 8",
    price: 30,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1575585269294-7d308290aae2?w=600&auto=format&fit=crop&q=80",
    location: "Denver, CO",
    rating: 4.8,
    reviewCount: 15,
    category: "Sports",
    isVerified: true,
    description: "Trek Fuel EX 8 mountain bike, size large. Perfect for trail riding with full suspension and hydraulic disc brakes.",
    owner: {
      name: "Emma Wilson",
      avatar: "https://randomuser.me/api/portraits/women/19.jpg",
      rating: 5.0,
      responseTime: "Within 30 minutes"
    }
  },
  {
    id: "5",
    title: "Canon EOS R6 Camera Body",
    price: 50,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80",
    location: "Austin, TX",
    rating: 4.9,
    reviewCount: 22,
    category: "Electronics",
    isVerified: true,
    description: "Canon EOS R6 mirrorless camera body. Great for photo and video with in-body image stabilization.",
    owner: {
      name: "David Garcia",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 4.7,
      responseTime: "Within 3 hours"
    }
  },
  {
    id: "6",
    title: "Designer Evening Gown - Size 6",
    price: 60,
    priceUnit: "event",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80",
    location: "New York, NY",
    rating: 4.6,
    reviewCount: 11,
    category: "Clothing",
    isVerified: false,
    description: "Beautiful designer evening gown, size 6. Perfect for galas, weddings, and formal events. Dry cleaned after each rental.",
    owner: {
      name: "Sophia Martinez",
      avatar: "https://randomuser.me/api/portraits/women/31.jpg",
      rating: 4.5,
      responseTime: "Within 5 hours"
    }
  },
  {
    id: "7",
    title: "Camping Equipment Bundle",
    price: 40,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&auto=format&fit=crop&q=80",
    location: "Portland, OR",
    rating: 4.7,
    reviewCount: 26,
    category: "Outdoors",
    isVerified: true,
    description: "Complete camping set including 4-person tent, 2 sleeping bags, camping stove, and lantern.",
    owner: {
      name: "Alex Turner",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      rating: 4.8,
      responseTime: "Within 2 hours"
    }
  },
  {
    id: "8",
    title: "Bose QuietComfort 45 Headphones",
    price: 15,
    priceUnit: "day",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    location: "Seattle, WA",
    rating: 4.9,
    reviewCount: 18,
    category: "Electronics",
    isVerified: true,
    description: "Bose QuietComfort 45 noise-cancelling headphones. Perfect for travel, work, or just enjoying music.",
    owner: {
      name: "Jamie Lee",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      rating: 4.9,
      responseTime: "Within 1 hour"
    }
  }
];
