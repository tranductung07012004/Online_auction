import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar, MenuItem } from "../../../components/SearchBar";
import { useSearchStore } from "../../../stores";
import { Category as CategoryIcon } from "@mui/icons-material";
import { getCategoriesGrouped } from "../../../api/categories";

interface CategoryGroup {
  parent: {
    id: number;
    name: string;
    parent_id: number | null;
  };
  children: {
    id: number;
    name: string;
    parent_id: number | null;
  }[];
}

/**
 * ProductSearchBar component
 *
 * This is a wrapper component that integrates the SearchBar into the Product page.
 * It provides the menu items and handlers specific to the Product page context.
 *
 * Usage:
 * import { ProductSearchBar } from './ProductSearchBar';
 *
 * // In your component:
 * <ProductSearchBar />
 */
export const ProductSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, filters, setSearchQuery, updateFilters } =
    useSearchStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [, setLoading] = useState(true);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const grouped = await getCategoriesGrouped();

        // Convert to menu items format
        const items: MenuItem[] = grouped.map((group: CategoryGroup) => ({
          text: group.parent.name,
          icon: <CategoryIcon />,
          path: "/admin/products",
          categoryId: group.parent.id,
          subcategories: group.children.map((child) => ({
            text: child.name,
            value: child.id.toString(),
          })),
        }));

        setMenuItems(items);
      } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback to empty menu items
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // Add search query
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    // Add filters
    if (filters.category) {
      params.set("category", filters.category);
    }
    if (filters.sort) {
      params.set("sort", filters.sort);
    }
    if (filters.endTime) {
      params.set("endTime", "desc");
    }

    // Navigate with all parameters
    navigate(`/admin/products?${params.toString()}`);
  };

  // Handle filter selection
  const handleFilterSelect = (newFilters: {
    category?: string;
    sort?: string;
    endTime?: boolean;
  }) => {
    // Update store
    updateFilters(newFilters);

    // Build URL from store state
    const params = new URLSearchParams();

    // Add search query
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    // Add all filters (including new ones)
    const updatedFilters = { ...filters, ...newFilters };
    if (updatedFilters.category) {
      params.set("category", updatedFilters.category);
    }
    if (updatedFilters.sort) {
      params.set("sort", updatedFilters.sort);
    }
    if (updatedFilters.endTime) {
      params.set("endTime", "desc");
    }

    // Navigate with all parameters
    navigate(`/admin/Products?${params.toString()}`);
  };

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      menuItems={menuItems}
      onFilterSelect={handleFilterSelect}
      placeholder="Search for products..."
      maxWidth={{ xs: "100%", md: "800px" }}
    />
  );
};

export default ProductSearchBar;
