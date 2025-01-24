import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFocus?: () => void;
}

const SearchBar = ({ onSearch, onFocus }: SearchBarProps) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[80%] max-w-2xl z-50">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by job title or company..."
          className="w-full pl-10 pr-4 py-3 border-2 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onSearch(e.target.value)}
          onFocus={onFocus}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
    </div>
  );
};

export default SearchBar;
