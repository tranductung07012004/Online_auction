import React, { useState, useEffect } from 'react';
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
  InputBase,
  Box,
  Divider,
  Avatar,
  Badge,
  Typography,
  Popover,
  Paper,
  Checkbox,
  FormControlLabel,
  Button,
  Radio,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CheckroomOutlined as DressIcon,
  InfoOutlined as AboutIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Smartphone as SmartPhoneIcon,
  Book as BookIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import logo from '../../public/LOGO.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearchStore, useNavigationStore } from '../stores';
import { useSearchSync } from '../hooks/useSearchSync';

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
      width: { xs: 60, md: 80 },
      height: { xs: 60, md: 80 },
      cursor: 'pointer',
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

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  menuItems: MenuItem[];
  onFilterSelect: (filters: { category?: string; sort?: string; endTime?: boolean }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  menuItems,
  onFilterSelect,
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const { filters, resetFilters: resetStoreFilters } = useSearchStore();
  
  // Local state for filter panel (UI state, not business logic)
  const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>(filters.sort || '');
  const [selectedEndTime, setSelectedEndTime] = useState<boolean>(filters.endTime || false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const filterPanelOpen = Boolean(filterAnchorEl);

  // Sync local state with store when filters change
  useEffect(() => {
    setSelectedCategory(filters.category || '');
    setSelectedSubCategory(filters.subcategory || '');
    setSelectedSort(filters.sort || '');
    setSelectedEndTime(filters.endTime || false);
  }, [filters]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleCategoryToggle = (path: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (path: string) => {
    setSelectedCategory(selectedCategory === path ? '' : path);
    setSelectedSubCategory(''); // Reset subcategory when main category changes
  };

  const handleSubCategoryChange = (subCategoryValue: string) => {
    setSelectedSubCategory(selectedSubCategory === subCategoryValue ? '' : subCategoryValue);
  };

  const handleSortChange = (sortType: string) => {
    setSelectedSort(selectedSort === sortType ? '' : sortType);
  };

  const handleEndTimeChange = () => {
    setSelectedEndTime(!selectedEndTime);
  };

  const handleApplyFilters = () => {
    const newFilters: { category?: string; subcategory?: string; sort?: string; endTime?: boolean } = {};
    // Convert path to category name (remove leading slash)
    if (selectedCategory) {
      newFilters.category = selectedCategory.replace(/^\//, '') || 'home';
    }
    if (selectedSubCategory) {
      newFilters.subcategory = selectedSubCategory;
    }
    if (selectedSort) newFilters.sort = selectedSort;
    if (selectedEndTime) newFilters.endTime = true;
    
    // Update store and trigger navigation via callback
    onFilterSelect(newFilters);
    handleFilterClose();
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSort('');
    setSelectedEndTime(false);
    setExpandedCategories(new Set());
    resetStoreFilters();
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={onSearchSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          maxWidth: { xs: '400px', md: '600px' },
          mx: { xs: 2, md: 4 },
          bgcolor: '#fdfcf9',
          border: '1px solid #EAEAEA',
          borderRadius: '24px',
          px: 1,
          py: 0.5,
          '&:hover': {
            borderColor: '#C3937C',
          },
          '&:focus-within': {
            borderColor: '#C3937C',
            boxShadow: '0 0 0 2px rgba(195, 147, 124, 0.1)',
          },
        }}
      >
        <InputBase
          placeholder="Search for product name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: 1,
            fontSize: { xs: '0.875rem', md: '1rem' },
            color: '#333',
            ml: 1,
            '& input::placeholder': {
              color: '#999',
              opacity: 1,
            },
          }}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: '#EAEAEA' }} />
        <IconButton
          onClick={handleFilterClick}
          size="small"
          sx={{
            color: '#C3937C',
            '&:hover': { bgcolor: 'rgba(195, 147, 124, 0.08)' },
          }}
        >
          <FilterListIcon />
        </IconButton>
        <IconButton
          type="submit"
          size="small"
          sx={{
            color: '#C3937C',
            '&:hover': { bgcolor: 'rgba(195, 147, 124, 0.08)' },
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Filter Panel */}
      <Popover
        open={filterPanelOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
        }}
      >
        <Paper
          sx={{
            p: 3,
            minWidth: 500,
            maxWidth: 600,
            bgcolor: '#fdfcf9',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: '#C3937C',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            Filters
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Two Column Layout: Categories (Left) and Sort (Right) */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            {/* Category Selection - Left Side */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  mb: 1.5,
                  color: '#333',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                Select based on categories
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {menuItems.map((item) => {
                  const isExpanded = expandedCategories.has(item.path);
                  const hasSubcategories = item.subcategories && item.subcategories.length > 0;
                  
                  return (
                    <Box key={item.text}>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={selectedCategory === item.path && !selectedSubCategory}
                            onChange={() => handleCategoryChange(item.path)}
                            sx={{
                              color: '#C3937C',
                              '&.Mui-checked': {
                                color: '#C3937C',
                              },
                            }}
                          />
                        }
                        label={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ color: '#C3937C', display: 'flex', alignItems: 'center' }}>
                                {item.icon}
                              </Box>
                              <Typography sx={{ color: '#333', fontSize: '0.9rem' }}>
                                {item.text}
                              </Typography>
                            </Box>
                            {hasSubcategories && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryToggle(item.path);
                                }}
                                sx={{
                                  color: '#C3937C',
                                  p: 0.5,
                                  '&:hover': { bgcolor: 'rgba(195, 147, 124, 0.08)' },
                                }}
                              >
                                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                              </IconButton>
                            )}
                          </Box>
                        }
                        sx={{
                          m: 0,
                          width: '100%',
                          '&:hover': {
                            bgcolor: 'rgba(195, 147, 124, 0.05)',
                            borderRadius: 1,
                          },
                          px: 1,
                          py: 0.5,
                        }}
                      />
                      {/* Subcategories */}
                      {hasSubcategories && (
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ pl: 4, pr: 1, pb: 0.5 }}>
                            {item.subcategories!.map((subCat) => (
                              <FormControlLabel
                                key={subCat.value}
                                control={
                                  <Radio
                                    checked={selectedCategory === item.path && selectedSubCategory === subCat.value}
                                    onChange={() => {
                                      setSelectedCategory(item.path);
                                      handleSubCategoryChange(subCat.value);
                                    }}
                                    size="small"
                                    sx={{
                                      color: '#C3937C',
                                      '&.Mui-checked': {
                                        color: '#C3937C',
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography sx={{ color: '#333', fontSize: '0.85rem' }}>
                                    {subCat.text}
                                  </Typography>
                                }
                                sx={{
                                  m: 0,
                                  display: 'block',
                                  '&:hover': {
                                    bgcolor: 'rgba(195, 147, 124, 0.03)',
                                    borderRadius: 1,
                                  },
                                  px: 1,
                                  py: 0.25,
                                }}
                              />
                            ))}
                          </Box>
                        </Collapse>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Vertical Divider */}
            <Divider orientation="vertical" flexItem />

            {/* Sort Options - Right Side */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  mb: 1.5,
                  color: '#333',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                Sort
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedEndTime}
                      onChange={handleEndTimeChange}
                      sx={{
                        color: '#C3937C',
                        '&.Mui-checked': {
                          color: '#C3937C',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: '#333', fontSize: '0.9rem' }}>
                      Select based on end time decreasing
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    '&:hover': {
                      bgcolor: 'rgba(195, 147, 124, 0.05)',
                      borderRadius: 1,
                    },
                    px: 1,
                    py: 0.5,
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSort === 'price-asc'}
                      onChange={() => handleSortChange('price-asc')}
                      sx={{
                        color: '#C3937C',
                        '&.Mui-checked': {
                          color: '#C3937C',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: '#333', fontSize: '0.9rem' }}>
                      Select based on time increasing
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    '&:hover': {
                      bgcolor: 'rgba(195, 147, 124, 0.05)',
                      borderRadius: 1,
                    },
                    px: 1,
                    py: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleResetFilters}
              sx={{
                color: '#666',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Reset
            </Button>
            <Button
              onClick={handleApplyFilters}
              variant="contained"
              sx={{
                bgcolor: '#C3937C',
                color: 'white',
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: '#B0836C',
                },
              }}
            >
              OK
            </Button>
          </Box>
        </Paper>
      </Popover>
    </>
  );
};

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
  
  // Zustand stores - single source of truth
  const { drawerOpen, setDrawerOpen } = useNavigationStore();
  const { searchQuery, filters, setSearchQuery, updateFilters } = useSearchStore();
  
  // Sync store with URL (unidirectional: URL -> Store)
  useSearchSync();

  // Toggle drawer
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };
  
  // Handle search query change - update store
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search - update store and navigate (unidirectional: Store -> URL)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Add search query from store
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }
    
    // Add filters from store
    if (filters.category) {
      params.set('category', filters.category);
    }
    if (filters.sort) {
      params.set('sort', filters.sort);
    }
    if (filters.endTime) {
      params.set('endTime', 'desc');
    }
    
    // Navigate with all parameters (Store -> URL)
    navigate(`/pcp?${params.toString()}`);
  };

  // Handle filter selection - update store and navigate (unidirectional: Store -> URL)
  const handleFilterSelect = (newFilters: { category?: string; subcategory?: string; sort?: string; endTime?: boolean }) => {
    // Update store
    updateFilters(newFilters);
    
    // Build URL from store state
    const params = new URLSearchParams();
    
    // Add search query from store
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }
    
    // Add all filters (including new ones)
    const updatedFilters = { ...filters, ...newFilters };
    if (updatedFilters.category) {
      params.set('category', updatedFilters.category);
    }
    if (updatedFilters.subcategory) {
      params.set('subcategory', updatedFilters.subcategory);
    }
    if (updatedFilters.sort) {
      params.set('sort', updatedFilters.sort);
    }
    if (updatedFilters.endTime) {
      params.set('endTime', 'desc');
    }
    
    // Navigate with all parameters (Store -> URL)
    navigate(`/pcp?${params.toString()}`);
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
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            py: 1,
          }}
        >
          {/* Left: Menu Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Logo */}
            <Logo onClick={() => navigate('/')} />
            <MenuButton onClick={() => setDrawerOpen(true)}/>
          </Box>

          {/* Center: Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            menuItems={menuItems}
            onFilterSelect={handleFilterSelect}
          />

          {/* Right: User Actions */}
          <UserActions
            onProfileClick={goToProfilePage}
            onCartClick={goToCartPage}
          />
        </Toolbar>
      </AppBar>

      {/* Drawer Menu */}
      <NavigationDrawer
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        logo={logo}
        menuItems={menuItems}
        onMenuItemClick={(path, subcategory) => {
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

