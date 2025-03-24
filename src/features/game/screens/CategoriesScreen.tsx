import React from 'react';
import CircleBackground from '../components/CircleBackground';

interface CategoriesScreenProps {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onReturnToMenu: () => void;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onReturnToMenu
}) => {
  return (
    <div 
      className="flex flex-col h-full bg-[#7b86eb]" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <CircleBackground />
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={onReturnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h2 className="text-xl font-bold">Categories</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="grid grid-cols-1 gap-3">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => onToggleCategory(category)}
              className={`p-4 rounded-lg text-left ${
                selectedCategories.includes(category)
                  ? 'bg-white text-black border-2 border-black'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <span className="font-medium">{category}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t relative z-10">
        <button 
          onClick={onReturnToMenu}
          className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-3xl shadow-lg"
        >
          Save Categories
        </button>
      </div>
    </div>
  );
};

export default CategoriesScreen;
