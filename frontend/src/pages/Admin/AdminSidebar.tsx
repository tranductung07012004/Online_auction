import React from "react";
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
} from "@mui/material";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: <Package size={20} />,
      path: "/admin/products",
    },
    {
      id: "categories",
      label: "Categories",
      icon: <ShoppingCart size={20} />,
      path: "/admin/categories",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          bgcolor: "#2c3e50",
          color: "white",
          pt: 2,
        },
      }}
    >
      <Box sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#E53935" }}>
          🎯 Admin Panel
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1, px: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                backgroundColor: isActive(item.path)
                  ? "rgba(229, 57, 53, 0.2)"
                  : "transparent",
                color: isActive(item.path)
                  ? "#E53935"
                  : "rgba(255,255,255,0.7)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
                "& .MuiListItemIcon-root": {
                  color: "inherit",
                  minWidth: 40,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", my: 2 }} />

      <Box sx={{ p: 2, mt: "auto" }}>
        <ListItemButton
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 1,
            color: "rgba(255,255,255,0.7)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.1)",
              color: "#E53935",
            },
            "& .MuiListItemIcon-root": {
              color: "inherit",
              minWidth: 40,
            },
          }}
        >
          <ListItemIcon>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
