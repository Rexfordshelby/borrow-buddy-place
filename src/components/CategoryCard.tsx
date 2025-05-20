
import { Link } from "react-router-dom";

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  itemCount: number;
  slug: string;
}

const CategoryCard = ({ icon, title, itemCount, slug }: CategoryCardProps) => {
  return (
    <Link to={`/category/${slug}`} className="group">
      <div className="bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-md flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 flex items-center justify-center mb-4 text-brand-600 bg-brand-50 rounded-full group-hover:bg-brand-100 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{itemCount} items</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
