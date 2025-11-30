import type React from 'react';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ placeholder = 'Search...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      setIsSearching(true);
      onSearch(query);
    }
  };

  // Reset isSearching state after animation
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center border-b border-gray-300 pb-2">
          <Search className={`h-5 w-5 mr-3 ${isSearching ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full outline-none bg-transparent text-gray-700"
            aria-label="Search"
          />
          <button 
            type="submit" 
            className="ml-3 px-4 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            aria-label="Search"
          >
            Search
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Search for dress names, e.g., "Floral Lace", "Mermaid"</p>
      </form>
    </div>
  );
}
