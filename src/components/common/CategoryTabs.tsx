interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
            selected === category
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-secondary-200 text-gray-700 hover:bg-secondary-500 hover:text-gray-800'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
