import { create } from 'zustand';

interface SearchFilters {
  category?: string;
  subcategory?: string;
  sort?: string;
  endTime?: boolean;
}

interface SearchState {
  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filters
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  resetFilters: () => void;
  
  // Combined actions
  updateSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
}

const initialFilters: SearchFilters = {
  category: undefined,
  sort: undefined,
  endTime: undefined,
};

export const useSearchStore = create<SearchState>((set) => ({
  // Initial state
  searchQuery: '',
  filters: initialFilters,
  
  // Actions
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  setFilters: (filters: SearchFilters) => set({ filters }),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  updateSearchQuery: (query: string) => set({ searchQuery: query }),
  
  updateFilters: (newFilters: Partial<SearchFilters>) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
}));

