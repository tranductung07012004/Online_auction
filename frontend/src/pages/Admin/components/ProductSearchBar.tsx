import React from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar, MenuItem } from "../../../components/SearchBar";
import { useSearchStore } from "../../../stores";
import {
  CheckroomOutlined as DressIcon,
  Smartphone as SmartPhoneIcon,
  Book as BookIcon,
} from "@mui/icons-material";

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

  // Menu items configuration (can be customized for Product page)
  const menuItems: MenuItem[] = [
    {
      text: "Smartphone",
      icon: <SmartPhoneIcon />,
      path: "/admin/Products",
      subcategories: [
        { text: "iPhone", value: "iphone" },
        { text: "Samsung", value: "samsung" },
        { text: "Xiaomi", value: "xiaomi" },
        { text: "Oppo", value: "oppo" },
      ],
    },
    {
      text: "Clothes",
      icon: <DressIcon />,
      path: "/admin/Products",
      subcategories: [
        { text: "Men", value: "men" },
        { text: "Women", value: "women" },
        { text: "Kids", value: "kids" },
        { text: "Accessories", value: "accessories" },
      ],
    },
    {
      text: "Book",
      icon: <BookIcon />,
      path: "/admin/Products",
      subcategories: [
        { text: "Fiction", value: "fiction" },
        { text: "Non-Fiction", value: "non-fiction" },
        { text: "Educational", value: "educational" },
      ],
    },
  ];

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
