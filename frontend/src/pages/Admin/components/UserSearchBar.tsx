import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchBar, MenuItem } from "../../../components/SearchBar";
import { useSearchStore } from "../../../stores";
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Person2 as BidderIcon,
} from "@mui/icons-material";

interface UserSearchBarProps {
  /** Controlled by Users page */
  searchKeyword: string;
  filterRole: string;
  onSearchChange: (keyword: string) => void;
  onRoleFilterChange: (role: string) => void;
}

export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchKeyword,
  filterRole,
  onSearchChange,
  onRoleFilterChange,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { searchQuery, setSearchQuery, filters, updateFilters } =
    useSearchStore();

  // Keep store in sync with parent state (Users page is the source of truth)
  useEffect(() => {
    setSearchQuery(searchKeyword || "");
    updateFilters({ category: filterRole || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, filterRole]);

  // Optional: also sync from URL -> parent (deep links)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";

    if (q !== searchKeyword) onSearchChange(q);
    if (role !== filterRole) onRoleFilterChange(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems: MenuItem[] = [
    { text: "Admin", icon: <AdminIcon />, path: "/admin/users" },
    { text: "Bidder", icon: <BidderIcon />, path: "/admin/users" },
    { text: "User", icon: <PersonIcon />, path: "/admin/users" },
  ];

  const navigateWith = (q: string, role: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role) params.set("role", role);
    navigate(`/admin/users?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
    navigateWith(searchQuery, filterRole);
  };

  const handleFilterSelect = (newFilters: {
    category?: string;
    sort?: string;
    endTime?: boolean;
  }) => {
    // We map SearchBar's `category` to `role` for Users page.
    const role = newFilters.category || "";

    updateFilters({ category: role || undefined });
    onRoleFilterChange(role);
    navigateWith(searchQuery, role);
  };

  // Provide a quick way to clear filters by hooking into store reset when user clicks Reset.
  // SearchBar currently resets store on Reset; we also want to reset parent state.
  useEffect(() => {
    // If store is reset elsewhere, reflect that into parent
    if (!filters.category && searchKeyword === "" && filterRole === "") return;
  }, [filters.category, filterRole, searchKeyword]);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      menuItems={menuItems}
      onFilterSelect={handleFilterSelect}
      placeholder="Search users by email..."
      maxWidth={{ xs: "100%", md: "800px" }}
    />
  );
};

export default UserSearchBar;
