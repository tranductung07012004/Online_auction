import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, MenuItem } from '../../../components/SearchBar';
import { useSearchStore } from '../../../stores';
import { getCategoriesGrouped, Category } from '../../../api/categories';
import { Category as CategoryIcon } from '@mui/icons-material';
import { CircularProgress, Box } from '@mui/material';


export const PCPSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, filters, setSearchQuery, updateFilters } = useSearchStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const groupedCategories = await getCategoriesGrouped();

        // Map categories to MenuItem format
        const mappedMenuItems: MenuItem[] = groupedCategories.map((group) => {
          const parentCategory = group.parent;
          const childrenCategories = group.children;

          return {
            text: parentCategory.name,
            icon: <CategoryIcon />,
            path: '/pcp',
            categoryId: parentCategory.id, // Store parent category ID
            subcategories: childrenCategories.map((child: Category) => ({
              text: child.name,
              value: child.id.toString(), // Store child category ID as string
            })),
          };
        });

        setMenuItems(mappedMenuItems);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to empty array on error
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to build search URL
  const buildSearchURL = (query: string, category?: string, sort?: string): string => {
    const params = new URLSearchParams();
    
    if (query.trim()) {
      params.set('q', query);
    }
    
    if (category) {
      params.set('category', category);
    }
    
    if (sort) {
      params.set('sort', sort);
    }
    
    return `/pcp?${params.toString()}`;
  };

  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildSearchURL(searchQuery, filters.category, filters.sort);
    navigate(url);
  };

  // Handle filter selection
  const handleFilterSelect = (newFilters: { 
    category?: string; 
    sort?: string;
  }) => {
    // Update store with new filters
    updateFilters(newFilters);
    
    // Build URL and navigate
    const url = buildSearchURL(searchQuery, newFilters.category, newFilters.sort);
    navigate(url);
  };

  // Show loading state while fetching categories
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      menuItems={menuItems}
      onFilterSelect={handleFilterSelect}
      placeholder="Search for products..."
      maxWidth={{ xs: '100%', md: '800px' }}
    />
  );
};

export default PCPSearchBar;



