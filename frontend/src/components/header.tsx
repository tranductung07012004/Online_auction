import React, { useState } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import logo from '../../public/LOGO.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigationStore } from '../stores';

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


const Logo: React.FC<LogoProps> = ({onClick}) => (
  <Box
    component="img"
    src={logo}
    alt="Logo"
    onClick={onClick}
    sx={{
      width: 100,
      height: 100,
      cursor: 'pointer'
    }}
  />
);

const MenuButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: '#C3937C',
      '&:hover': { bgcolor: 'rgba(195, 147, 124, 0.08)' },
    }}
  >
    <MenuIcon sx={{ fontSize: 28 }} />
  </IconButton>
);


interface UserActionsProps {
  onProfileClick: () => void;
  onCartClick: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({ onProfileClick, onCartClick }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
    <IconButton
      onClick={onProfileClick}
      sx={{
        color: '#C3937C',
        '&:hover': { bgcolor: 'rgba(195, 147, 124, 0.08)' },
      }}
    >
      <PersonIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
    </IconButton>

    <IconButton
      onClick={onCartClick}
      sx={{
        color: '#C3937C',
        '&:hover': { bgcolor: 'rgba(195, 147, 124, 0.08)' },
      }}
    >
      <Badge badgeContent={0} color="error">
        <CartIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
      </Badge>
    </IconButton>
  </Box>
);

interface DrawerLogoProps {
  logo: string;
}

const DrawerLogo: React.FC<DrawerLogoProps> = ({ logo }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 2,
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{ width: 80, height: 80 }}
    />
  </Box>
);


interface MenuItemsListProps {
  items: MenuItem[];
  onItemClick: (path: string, subcategory?: string) => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({ items, onItemClick }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (path: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  return (
    <List>
      {items.map((item) => {
        const isExpanded = expandedItems.has(item.path);
        const hasSubcategories = item.subcategories && item.subcategories.length > 0;

        return (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (hasSubcategories) {
                    handleToggle(item.path);
                  } else {
                    onItemClick(item.path);
                  }
                }}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(195, 147, 124, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#C3937C', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: '#C3937C',
                      fontWeight: 500,
                    },
                  }}
                />
                {hasSubcategories && (
                  <Box sx={{ color: '#C3937C' }}>
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
                          borderRadius: '8px',
                          mb: 0.5,
                          '&:hover': {
                            bgcolor: 'rgba(195, 147, 124, 0.05)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={subCat.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: '#C3937C',
                              fontWeight: 400,
                              fontSize: '0.9rem',
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
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: 'rgba(195, 147, 124, 0.08)',
        borderRadius: '8px',
      }}
    >
      <Avatar sx={{ bgcolor: '#C3937C' }}>
        {role === 'admin' ? 'A' : 'U'}
      </Avatar>
      <Box>
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
          {role === 'admin' ? 'Admin' : 'User'}
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: '#666' }}>
          Logged in
        </Box>
      </Box>
    </Box>
  );
};

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  logo: string;
  menuItems: MenuItem[];
  onMenuItemClick: (path: string, subcategory?: string) => void;
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
      '& .MuiDrawer-paper': {
        width: { xs: 280, sm: 320 },
        bgcolor: '#fdfcf9',
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

const Header: React.FC<NavigationProps> = ({ isSticky = false }) => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();
  
  // Zustand stores
  const { drawerOpen, setDrawerOpen } = useNavigationStore();

  // Toggle drawer
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Navigation handlers
  const goToProfilePage = (): void => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/signin');
    }
  };

  const goToCartPage = (): void => {
    navigate('/cart');
  };

  // Menu items configuration with subcategories
  const menuItems: MenuItem[] = [
    { 
      text: 'Home', 
      icon: <HomeIcon />, 
      path: '/'
    },
    { 
      text: 'All Products', 
      icon: <StoreIcon />, 
      path: '/pcp'
    },
    { 
      text: 'Smartphone', 
      icon: <SmartPhoneIcon />, 
      path: '/pcp',
      subcategories: [
        { text: 'iPhone', value: 'iphone' },
        { text: 'Samsung', value: 'samsung' },
        { text: 'Xiaomi', value: 'xiaomi' },
        { text: 'Oppo', value: 'oppo' },
      ]
    },
    { 
      text: 'Clothes', 
      icon: <DressIcon />, 
      path: '/photography',
      subcategories: [
        { text: 'Men', value: 'men' },
        { text: 'Women', value: 'women' },
        { text: 'Kids', value: 'kids' },
        { text: 'Accessories', value: 'accessories' },
      ]
    },
    { 
      text: 'Book', 
      icon: <BookIcon />, 
      path: '/appointment',
      subcategories: [
        { text: 'Fiction', value: 'fiction' },
        { text: 'Non-Fiction', value: 'non-fiction' },
        { text: 'Educational', value: 'educational' },
      ]
    },
    { 
      text: 'About', 
      icon: <AboutIcon />, 
      path: '/about' 
    },
  ];

  return (
    <>
      <AppBar
        position={isSticky ? 'sticky' : 'static'}
        sx={{
          bgcolor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #EAEAEA',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            py: 1,
          }}
        >
          {/* Left: Menu Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <MenuButton onClick={() => setDrawerOpen(true)}/>
          </Box>

          {/* Center: Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
            <Logo onClick={() => navigate('/')} />
          </Box>

          {/* Right: User Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
            <UserActions
              onProfileClick={goToProfilePage}
              onCartClick={goToCartPage}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Menu */}
      <NavigationDrawer
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        logo={logo}
        menuItems={menuItems}
        onMenuItemClick={(path, subcategory) => {
          // If "All Products" is clicked, navigate directly to /pcp without query params
          const allProductsItem = menuItems.find(item => item.text === 'All Products' && item.path === path);
          if (allProductsItem) {
            navigate('/pcp');
            setDrawerOpen(false);
            return;
          }
          
          // Build URL with category and subcategory if provided
          const params = new URLSearchParams();
          const categoryName = path.replace(/^\//, '') || 'home';
          params.set('category', categoryName);
          
          if (subcategory) {
            params.set('subcategory', subcategory);
          }
          
          // Navigate to PCP with filters, or to the path if it's not PCP
          if (path === '/pcp' || path.startsWith('/pcp')) {
            navigate(`/pcp?${params.toString()}`);
          } else {
            navigate(path);
          }
          setDrawerOpen(false);
        }}
        isAuthenticated={isAuthenticated}
        role={role}
      />
    </>
  );
};

export default Header;

