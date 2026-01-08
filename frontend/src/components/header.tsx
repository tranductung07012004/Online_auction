import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Avatar,
  Badge,
  Collapse,
  CircularProgress
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Store as StoreIcon,
  Inventory2 as InventoryIcon,
  Category as CategoryIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Package, Users } from "lucide-react";
import logo from "/LOGO.png";
import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "../stores";
import { useAuthStore } from "../stores/authStore";
import { getCategoriesGrouped } from "../api/categories";

// MenuItem type for drawer menu
interface SubCategory {
  text: string;
  value: string | undefined; // This will be the category id as string
  id: number; // Store the actual id
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  categoryId?: number; // Store category id for parent categories
  subcategories?: SubCategory[];
}

interface NavigationProps {
  isSticky?: boolean;
}

interface LogoProps {
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      width: { xs: "50px", sm: "60px", md: "70px", lg: "80px" },
      height: { xs: "50px", sm: "60px", md: "70px", lg: "80px" },
      overflow: "hidden",
      cursor: "pointer",
      borderRadius: "8px",
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  </Box>
);

const MenuButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: "#C3937C",
      "&:hover": { bgcolor: "rgba(195, 147, 124, 0.08)" },
    }}
  >
    <MenuIcon sx={{ fontSize: 28 }} />
  </IconButton>
);

interface UserActionsProps {
  onProfileClick: () => void;
  onCartClick: () => void;
  onCreateProductClick: () => void;
  isAdmin?: boolean;
}

const UserActions: React.FC<UserActionsProps> = ({
  onProfileClick,
  onCartClick,
  onCreateProductClick,
  isAdmin = false,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
    {!isAdmin && (
      <IconButton
        onClick={onCreateProductClick}
        sx={{
          color: "#C3937C",
          "&:hover": { bgcolor: "rgba(195, 147, 124, 0.08)" },
        }}
      >
        <InventoryIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
      </IconButton>
    )}

    <IconButton
      onClick={onProfileClick}
      sx={{
        color: "#C3937C",
        "&:hover": { bgcolor: "rgba(195, 147, 124, 0.08)" },
      }}
    >
      <PersonIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
    </IconButton>

    {!isAdmin && (
      <IconButton
        onClick={onCartClick}
        sx={{
          color: "#C3937C",
          "&:hover": { bgcolor: "rgba(195, 147, 124, 0.08)" },
        }}
      >
        <Badge badgeContent={0} color="error">
          <CartIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
        </Badge>
      </IconButton>
    )}
  </Box>
);

interface DrawerLogoProps {
  logo: string;
}

const DrawerLogo: React.FC<DrawerLogoProps> = ({ logo }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 2,
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{ width: 80, height: 80, objectFit: "cover" }}
    />
  </Box>
);

interface MenuItemsListProps {
  items: MenuItem[];
  onItemClick: (path: string, category: string | undefined) => void;
  sectionTitle?: string;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({
  items,
  onItemClick,
  sectionTitle,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (itemText: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemText)) {
        newSet.delete(itemText);
      } else {
        newSet.add(itemText);
      }
      return newSet;
    });
  };

  return (
    <>
      {sectionTitle && (
        <Box
          sx={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#C3937C",
            mb: 1,
            px: 2,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {sectionTitle}
        </Box>
      )}
      <List>
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.text);
          const hasSubcategories =
            item.subcategories && item.subcategories.length > 0;

          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    // Pass category id if available, otherwise pass text
                    const categoryValue = item.categoryId?.toString();
                    onItemClick(item.path, categoryValue);
                  }}
                  sx={{
                    borderRadius: "8px",
                    mb: 1,
                    "&:hover": {
                      bgcolor: "rgba(195, 147, 124, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#C3937C", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "#C3937C",
                        fontWeight: 500,
                      },
                    }}
                  />
                  {hasSubcategories && (
                    <Box
                      sx={{ color: "#C3937C", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.text);
                      }}
                    >
                      {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              {/* Subcategories */}
              {hasSubcategories && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subcategories!.map((subCat) => (
                      <ListItem key={subCat.id} disablePadding>
                        <ListItemButton
                          onClick={() => onItemClick(item.path, subCat.value)}
                          sx={{
                            pl: 6,
                            borderRadius: "8px",
                            mb: 0.5,
                            "&:hover": {
                              bgcolor: "rgba(195, 147, 124, 0.05)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={subCat.text}
                            sx={{
                              "& .MuiListItemText-primary": {
                                color: "#C3937C",
                                fontWeight: 400,
                                fontSize: "0.9rem",
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </>
  );
};

interface UserInfoProps {
  isAuthenticated: boolean;
  role: string | null;
  onLogout?: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  isAuthenticated,
  role,
  onLogout,
}) => {
  if (!isAuthenticated) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 2,
        bgcolor: "rgba(195, 147, 124, 0.08)",
        borderRadius: "8px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#C3937C" }}>
          {role === "ADMIN" ? "A" : "U"}
        </Avatar>
        <Box>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#333" }}>
            {role === "ADMIN" ? "Admin" : role === "SELLER" ? "Seller" : role === "BIDDER" ? "Bidder" : "User"}
          </Box>
          <Box sx={{ fontSize: "0.75rem", color: "#666" }}>Logged in</Box>
        </Box>
      </Box>
      {onLogout && (
        <IconButton
          onClick={onLogout}
          sx={{
            color: "#C3937C",
            "&:hover": { bgcolor: "rgba(195, 147, 124, 0.15)" },
          }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

interface UserNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  logo: string;
  menuItems: MenuItem[];
  onMenuItemClick: (path: string, category: string | undefined) => void;
  categoriesLoading: boolean;
}

const UserNavigationDrawer: React.FC<UserNavigationDrawerProps> = ({
  open,
  onClose,
  logo,
  menuItems,
  onMenuItemClick,
  categoriesLoading,
}) => (
  <Drawer
    anchor="left"
    open={open}
    onClose={onClose}
    sx={{
      "& .MuiDrawer-paper": {
        width: { xs: 280, sm: 320 },
        bgcolor: "#fdfcf9",
      },
    }}
  >
    <Box sx={{ p: 3 }}>
      <DrawerLogo logo={logo} />
      <Divider sx={{ my: 2 }} />
      {categoriesLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} sx={{ color: "#C3937C" }} />
        </Box>
      ) : (
        <MenuItemsList items={menuItems} onItemClick={onMenuItemClick} />
      )}
    </Box>
  </Drawer>
);

interface AdminNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  logo: string;
  menuItems: MenuItem[];
  onMenuItemClick: (path: string, category: string | undefined) => void;
}

const AdminNavigationDrawer: React.FC<AdminNavigationDrawerProps> = ({
  open,
  onClose,
  logo,
  menuItems,
  onMenuItemClick,
}) => (
  <Drawer
    anchor="left"
    open={open}
    onClose={onClose}
    sx={{
      "& .MuiDrawer-paper": {
        width: { xs: 280, sm: 320 },
        bgcolor: "#fdfcf9",
      },
    }}
  >
    <Box
      sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <DrawerLogo logo={logo} />
      <Divider sx={{ my: 2 }} />

      {/* Menu Items */}
      <MenuItemsList items={menuItems} onItemClick={onMenuItemClick} />

      <Box sx={{ flexGrow: 1 }} />
    </Box>
  </Drawer>
);

const Header: React.FC<NavigationProps> = ({ isSticky = true }) => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuthStore();

  const isAdmin = role === "ADMIN";

  const { drawerOpen, setDrawerOpen } = useNavigationStore();

  const [userMenuItems, setUserMenuItems] = useState<MenuItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const goToProfilePage = (): void => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/signin");
    }
  };

  const goToCartPage = (): void => {
    navigate("/cart");
  };

  const goToCreateProductPage = (): void => {
    navigate("/create-product");
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      if (isAdmin) {
        // Admin doesn't need category menu, set loading to false
        setCategoriesLoading(false);
        return;
      }

      try {
        setCategoriesLoading(true);
        const groupedCategories = await getCategoriesGrouped();

        // Build menu items from API data
        const menuItems: MenuItem[] = [
          {
            text: "Home",
            icon: <HomeIcon />,
            path: "/",
          },
          {
            text: "All Products",
            icon: <StoreIcon />,
            path: "/pcp",
          },
        ];

        // Add categories from API
        groupedCategories.forEach((group) => {
          const parentCategory = group.parent;
          const childrenCategories = group.children;

          const menuItem: MenuItem = {
            text: parentCategory.name,
            icon: <CategoryIcon />,
            path: "/pcp",
            categoryId: parentCategory.id,
            subcategories: childrenCategories.map((child) => ({
              text: child.name,
              value: child.id.toString(), // Store id as string in value
              id: child.id, // Store actual id
            })),
          };

          menuItems.push(menuItem);
        });

        setUserMenuItems(menuItems);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default menu items on error
        setUserMenuItems([
          {
            text: "Home",
            icon: <HomeIcon />,
            path: "/",
          },
          {
            text: "All Products",
            icon: <StoreIcon />,
            path: "/pcp",
          },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isAdmin]);

  // Admin menu items configuration
  const adminMenuItems: MenuItem[] = [
    {
      text: "Dashboard",
      icon: <AdminIcon />,
      path: "/admin/dashboard",
    },
    {
      text: "Categories",
      icon: <CategoryIcon />,
      path: "/admin/categories",
    },
    {
      text: "Manage Users",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      text: "Manage Products",
      icon: <Package size={20} />,
      path: "/admin/products",
    },
  ];

  // Handle menu item click for user drawer
  const handleUserMenuItemClick = (path: string, category: string | undefined) => {
    // category can be either category name or category id (as string)
    if (
      category === "All Products" ||
      category === "Home"
    ) {
      navigate(path);
      setDrawerOpen(false);
      return;
    }

    if (path === "/pcp" && category) {
      const params = new URLSearchParams();
      // category is the id (as string) when clicking on subcategory
      // or categoryId when clicking on parent category
      // Check if it's a number (id) or name
      const categoryId = parseInt(category, 10);
      if (!isNaN(categoryId)) {
        // It's a category id
        params.set("category", categoryId.toString());
      } else {
        // It's a category name, find the id from menuItems
        const menuItem = userMenuItems.find(
          (item) => item.text === category || item.categoryId?.toString() === category
        );
        if (menuItem?.categoryId) {
          params.set("category", menuItem.categoryId.toString());
        } else {
          // Fallback: use category name (for backward compatibility)
          params.set("category", category.toLowerCase());
        }
      }
      navigate(`/pcp?${params.toString()}`);
    } else {
      navigate(path);
    }
    setDrawerOpen(false);
  };

  // Handle menu item click for admin drawer
  const handleAdminMenuItemClick = (path: string, _category: string | undefined) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position={isSticky ? "sticky" : "static"}
        sx={{
          bgcolor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          borderBottom: "1px solid #EAEAEA",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 4 },
            py: 1,
          }}
        >
          {/* Left: Menu Button */}
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <MenuButton onClick={() => setDrawerOpen(true)} />
          </Box>

          {/* Center: Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <Logo
              onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/")}
            />
          </Box>

          {/* Right: User Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
            <UserActions
              onProfileClick={goToProfilePage}
              onCartClick={goToCartPage}
              onCreateProductClick={goToCreateProductPage}
              isAdmin={isAdmin}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Conditional Drawer based on role */}
      {isAdmin ? (
        <AdminNavigationDrawer
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          logo={logo}
          menuItems={adminMenuItems}
          onMenuItemClick={handleAdminMenuItemClick}
        />
      ) : (
        <UserNavigationDrawer
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          logo={logo}
          menuItems={userMenuItems}
          onMenuItemClick={handleUserMenuItemClick}
          categoriesLoading={categoriesLoading}
        />
      )}
    </>
  );
};

export default Header;
