
import { Link } from "react-router-dom";

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  itemCount: number;
  slug: string;
  gradient?: string;
}

const CategoryCard = ({ icon, title, itemCount, slug, gradient = "from-gray-500 to-gray-700" }: CategoryCardProps) => {
  return (
    <Link to={`/category/${slug}`} className="group">
      <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div className={`bg-gradient-to-br ${gradient} p-8 text-white relative`}>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors backdrop-blur-sm">
              {icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm opacity-90">{itemCount} items</p>
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
