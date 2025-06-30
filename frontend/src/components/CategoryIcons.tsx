import { IconType } from "react-icons";
import { 
  FaUtensils,      // 맛집
  FaCoffee,        // 카페
  FaUmbrellaBeach, // 해변
  FaMountain,      // 자연명소
  FaPalette,       // 문화예술
  FaShoppingBag,   // 쇼핑
  FaRunning        // 체험/액티비티
} from "react-icons/fa";
import { CustomCategory } from "@/types/place";

interface Category {
  id: CustomCategory;
  name: string;
  icon: IconType;
}

const CATEGORIES: Category[] = [
  { id: '맛집', name: '맛집', icon: FaUtensils },
  { id: '카페', name: '카페', icon: FaCoffee },
  { id: '해변', name: '해변', icon: FaUmbrellaBeach },
  { id: '자연명소', name: '자연명소', icon: FaMountain },
  { id: '문화예술', name: '문화예술', icon: FaPalette },
  { id: '쇼핑', name: '쇼핑', icon: FaShoppingBag },
  { id: '체험/액티비티', name: '체험/액티비티', icon: FaRunning },
];

interface CategoryIconsProps {
  selectedCategory: string;
  onSelect: (id: CustomCategory) => void;
}

export default function CategoryIcons({ selectedCategory, onSelect }: CategoryIconsProps) {
  return (
    <div className="flex justify-start sm:justify-center items-center gap-3 sm:gap-4 
                    px-4 sm:px-6 py-3 sm:py-4 overflow-x-auto hide-scrollbar 
                    w-full max-w-2xl">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`flex flex-col items-center min-w-[64px] sm:min-w-[72px] 
                     p-2 rounded-lg transition-all
                     active:scale-95 touch-manipulation
                     ${selectedCategory === category.id 
                       ? 'bg-gray-100 text-gray-900 font-medium' 
                       : 'text-gray-600 hover:bg-gray-50'
                     }`}
        >
          <category.icon className="text-xl sm:text-2xl mb-1.5" />
          <span className="text-[10px] sm:text-xs whitespace-nowrap leading-tight text-center">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
} 