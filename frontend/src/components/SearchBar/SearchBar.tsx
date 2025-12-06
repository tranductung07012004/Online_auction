import React, { useState, useEffect } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Divider,
  Popover,
  Paper,
  Typography,
  FormControlLabel,
  Button,
  Radio,
  Checkbox,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useSearchStore } from '../../stores';

export interface SubCategory {
  text: string;
  value: string;
}

export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  subcategories?: SubCategory[];
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  menuItems: MenuItem[];
  onFilterSelect: (filters: { category?: string; sort?: string; endTime?: boolean }) => void;
  placeholder?: string;
  maxWidth?: { xs: string; md: string };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  menuItems,
  onFilterSelect,
  placeholder = 'Search for product name',
  maxWidth = { xs: '400px', md: '600px' },
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const { filters, resetFilters: resetStoreFilters } = useSearchStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || '');
  const [selectedSort, setSelectedSort] = useState<string>(filters.sort || '');
  const [selectedEndTime, setSelectedEndTime] = useState<boolean>(filters.endTime || false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const filterPanelOpen = Boolean(filterAnchorEl);

  useEffect(() => {
    setSelectedCategory(filters.category || '');
    setSelectedSort(filters.sort || '');
    setSelectedEndTime(filters.endTime || false);
  }, [filters]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleCategoryToggle = (itemText: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemText)) {
        newSet.delete(itemText);
      } else {
        newSet.add(itemText);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleSortChange = (sortType: string) => {
    setSelectedSort(selectedSort === sortType ? '' : sortType);
  };

  const handleEndTimeChange = () => {
    setSelectedEndTime(!selectedEndTime);
  };

  const handleApplyFilters = () => {
    const newFilters: { category?: string; sort?: string; endTime?: boolean } = {};
    
    if (selectedCategory) {
      newFilters.category = selectedCategory;
    }
    if (selectedSort) newFilters.sort = selectedSort;
    if (selectedEndTime) newFilters.endTime = true;
    
    // Update store and trigger navigation via callback
    onFilterSelect(newFilters);
    handleFilterClose();
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
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
          maxWidth: maxWidth,
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
          placeholder={placeholder}
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
                  const isExpanded = expandedCategories.has(item.text);
                  const hasSubcategories = item.subcategories && item.subcategories.length > 0;
                  
                  // Main category value (smartphone, clothes, book)
                  const mainCategoryValue = item.text.toLowerCase();
                  
                  return (
                    <Box key={item.text}>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={selectedCategory === mainCategoryValue}
                            onChange={() => handleCategoryChange(mainCategoryValue)}
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
                                  handleCategoryToggle(item.text);
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
                                    checked={selectedCategory === subCat.value}
                                    onChange={() => handleCategoryChange(subCat.value)}
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

export default SearchBar;



