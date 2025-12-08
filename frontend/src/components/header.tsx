import React, { useState } from "react";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CheckroomOutlined as DressIcon,
  InfoOutlined as AboutIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Smartphone as SmartPhoneIcon,
  Book as BookIcon,
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
import { useAuth } from "../context/AuthContext";
import { useNavigationStore } from "../stores";

// MenuItem type for drawer menu
interface SubCategory {
  text: string;
  value: string;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
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
  onItemClick: (path: string, category: string) => void;
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
                    onItemClick(item.path, item.text);
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
                      <ListItem key={subCat.value} disablePadding>
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
          {role === "admin" ? "A" : "U"}
        </Avatar>
        <Box>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#333" }}>
            {role === "admin" ? "Admin" : "User"}
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

// ==================== USER DRAWER ====================
interface UserNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  logo: string;
  menuItems: MenuItem[];
  onMenuItemClick: (path: string, category: string) => void;
  isAuthenticated: boolean;
  role: string | null;
}

const UserNavigationDrawer: React.FC<UserNavigationDrawerProps> = ({
  open,
  onClose,
  logo,
  menuItems,
  onMenuItemClick,
  isAuthenticated,
  role,
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
      <MenuItemsList items={menuItems} onItemClick={onMenuItemClick} />
      <Divider sx={{ my: 2 }} />
      <UserInfo isAuthenticated={isAuthenticated} role={role} />
    </Box>
  </Drawer>
);

// ==================== ADMIN DRAWER ====================
interface AdminNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  logo: string;
  menuItems: MenuItem[];
  onMenuItemClick: (path: string, category: string) => void;
  isAuthenticated: boolean;
  role: string | null;
  onLogout?: () => void;
}

const AdminNavigationDrawer: React.FC<AdminNavigationDrawerProps> = ({
  open,
  onClose,
  logo,
  menuItems,
  onMenuItemClick,
  isAuthenticated,
  role,
  onLogout,
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

      <Divider sx={{ my: 2 }} />
      <UserInfo
        isAuthenticated={isAuthenticated}
        role={role}
        onLogout={onLogout}
      />
    </Box>
  </Drawer>
);

const Header: React.FC<NavigationProps> = ({ isSticky = true }) => {
  const navigate = useNavigate();
  // const { role, isAuthenticated } = useAuth();
  const { role, isAuthenticated } = { role: "admin", isAuthenticated: true };

  const isAdmin = role === "admin";

  // Zustand stores
  const { drawerOpen, setDrawerOpen } = useNavigationStore();

  // Toggle drawer
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Navigation handlers
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

  const handleLogout = (): void => {
    // TODO: Implement logout logic
    console.log("Logout clicked");
    navigate("/signin");
  };

  // User menu items configuration with subcategories
  const userMenuItems: MenuItem[] = [
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
    {
      text: "Smartphone",
      icon: <SmartPhoneIcon />,
      path: "/pcp",
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
      path: "/pcp",
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
      path: "/pcp",
      subcategories: [
        { text: "Fiction", value: "fiction" },
        { text: "Non-Fiction", value: "non-fiction" },
        { text: "Educational", value: "educational" },
      ],
    },
    {
      text: "About",
      icon: <AboutIcon />,
      path: "/about",
    },
  ];

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
  const handleUserMenuItemClick = (path: string, category: string) => {
    if (
      category === "All Products" ||
      category === "Home" ||
      category === "About"
    ) {
      navigate(path);
      setDrawerOpen(false);
      return;
    }

    if (path === "/pcp") {
      const params = new URLSearchParams();
      const categoryValue = category.toLowerCase();
      params.set("category", categoryValue);
      navigate(`/pcp?${params.toString()}`);
    } else {
      navigate(path);
    }
    setDrawerOpen(false);
  };

  // Handle menu item click for admin drawer
  const handleAdminMenuItemClick = (path: string, _category: string) => {
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
          isAuthenticated={isAuthenticated}
          role={role}
          onLogout={handleLogout}
        />
      ) : (
        <UserNavigationDrawer
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          logo={logo}
          menuItems={userMenuItems}
          onMenuItemClick={handleUserMenuItemClick}
          isAuthenticated={isAuthenticated}
          role={role}
        />
      )}
    </>
  );
};

export default Header;
