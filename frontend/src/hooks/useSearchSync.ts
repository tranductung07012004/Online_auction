import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useSearchStore } from '../stores/searchStore';

/**
 * Hook to sync search store with URL parameters
 * Implements unidirectional data flow: URL -> Store
 */
export const useSearchSync = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { searchQuery, filters, setSearchQuery, setFilters } = useSearchStore();
  const prevLocationRef = useRef<string>(location.pathname + location.search);

  useEffect(() => {
    const currentLocation = location.pathname + location.search;
    
    // Only sync when location actually changes (navigation), not while typing
    if (currentLocation !== prevLocationRef.current) {
      // Sync search query from URL
      const urlQuery = searchParams.get('q') || '';
      if (urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
      }
      
      // Sync filters from URL
      const urlCategory = searchParams.get('category') || undefined;
      const urlSubCategory = searchParams.get('subcategory') || undefined;
      const urlSort = searchParams.get('sort') || undefined;
      const urlEndTime = searchParams.get('endTime') === 'desc' ? true : undefined;
      
      setFilters({
        category: urlCategory,
        subcategory: urlSubCategory,
        sort: urlSort,
        endTime: urlEndTime,
      });
      
      prevLocationRef.current = currentLocation;
    }
  }, [location, searchParams, searchQuery, filters, setSearchQuery, setFilters]);
};

