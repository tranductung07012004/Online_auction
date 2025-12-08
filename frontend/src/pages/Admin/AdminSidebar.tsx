import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Category as CategoryIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
const logo = "/LOGO.png";
import { useNavigate } from "react-router-dom";

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
                </ListItemButton>
              </ListItem>
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
}

const UserInfo: React.FC<UserInfoProps> = ({ isAuthenticated, role }) => {
  if (!isAuthenticated) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        bgcolor: "rgba(195, 147, 124, 0.08)",
        borderRadius: "8px",
      }}
    >
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
  );
};

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  logo: string;
  menuItems: MenuItem[];
  onMenuItemClick: (path: string, category: string) => void;
  isAuthenticated: boolean;
  role: string | null;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
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

      {/* Menu Items */}
      <MenuItemsList
        items={menuItems}
        onItemClick={onMenuItemClick}
        sectionTitle="Menu"
      />

      <Divider sx={{ my: 2 }} />
      <UserInfo isAuthenticated={isAuthenticated} role={role} />
    </Box>
  </Drawer>
);

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const menuItems: MenuItem[] = [
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
      icon: <Users />,
      path: "/admin/users",
    },
    {
      text: "Manage Products",
      icon: <Package />,
      path: "/admin/products",
    },
  ];
  return (
    <NavigationDrawer
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      logo={logo}
      menuItems={menuItems}
      onMenuItemClick={(path, category) => {
        navigate(path);
        toggleDrawer(false)();
      }}
      isAuthenticated={true}
      role="admin"
    />
  );
};

export default AdminSidebar;
