import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ProductCard from '../../components/ProductCard';
import { Link, useSearchParams } from 'react-router-dom';
// TODO: Uncomment when backend is ready
// import { getAllProducts, searchProducts, Product } from '../../api/product';
import { PCPSearchBar } from './pcp/PCPSearchBar';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useSearchSync } from '../../hooks/useSearchSync';

// Fake data interface matching ProductProps
interface FakeProduct {
  id: number;
  product_name: string;
  thumpnail_url: string;
  seller: {
    id: number;
    avatar: string;
    fullname: string;
  };
  buy_now_price: number | null;
  minimum_bid_step: number;
  start_at: string | Date;
  end_at: string | Date;
  current_price: number;
  highest_bidder: {
    id: number;
    avatar: string;
    fullname: string;
  } | null;
  created_at?: string | Date;
  posted_at?: string | Date;
  bid_count: number;
}

// Generate fake products data
const generateFakeProducts = (): FakeProduct[] => {
  const now = new Date();
  const sellers = [
    { id: 1, avatar: '/placeholder-user.jpg', fullname: 'Nguyễn Văn A' },
    { id: 2, avatar: '/placeholder-user.jpg', fullname: 'Trần Thị B' },
    { id: 3, avatar: '/placeholder-user.jpg', fullname: 'Lê Văn C' },
    { id: 4, avatar: '/placeholder-user.jpg', fullname: 'Phạm Thị D' },
    { id: 5, avatar: '/placeholder-user.jpg', fullname: 'Hoàng Văn E' },
  ];

  const productNames = [
    'Tranh the ki trong',
    'De tam de che',
    'Da hoi ao dai',
    'Thang canh ky phong',
    'Thanh guom cua vua Louis III',
    'Chen thanh',
    'Ke huy diet',
    'Hung thu tiec tan',
    'Tranh cua picasso',
    'Nguoi dep to lua',
    'Mot ngay nang',
    'Berserk',
  ];

  const bidders = [
    { id: 6, avatar: '/placeholder-user.jpg', fullname: 'Lý Văn F' },
    { id: 7, avatar: '/placeholder-user.jpg', fullname: 'Đỗ Thị G' },
    { id: 8, avatar: '/placeholder-user.jpg', fullname: 'Bùi Văn H' },
    { id: 9, avatar: '/placeholder-user.jpg', fullname: 'Vũ Thị I' },
    { id: 10, avatar: '/placeholder-user.jpg', fullname: 'Đinh Văn J' },
  ];

  return productNames.map((name, index) => {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7);
    
    const buyNowPrice = Math.floor(Math.random() * 5000000) + 1000000; // 1M - 6M VND
    const minBidStep = Math.floor(buyNowPrice * 0.05); // 5% of buy now price
    const currentPrice = Math.floor(buyNowPrice * (0.6 + Math.random() * 0.3)); // 60-90% of buy now price
    const bidCount = Math.floor(Math.random() * 50) + 1; // 1-50 bids
    const hasHighestBidder = Math.random() > 0.2; // 80% chance of having a bidder
    const postedDate = new Date(startDate);
    postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 3)); // Posted 0-3 days before start

    return {
      id: index + 1,
      product_name: name,
      thumpnail_url: '/placeholder.svg',
      seller: sellers[Math.floor(Math.random() * sellers.length)],
      buy_now_price: Math.random() > 0.1 ? buyNowPrice : null, // 90% have buy now price
      minimum_bid_step: minBidStep,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      current_price: currentPrice,
      highest_bidder: hasHighestBidder ? bidders[Math.floor(Math.random() * bidders.length)] : null,
      created_at: postedDate.toISOString(),
      bid_count: bidCount,
    };
  });
};

export default function ProductPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  
  // Sync search store with URL
  useSearchSync();
  
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [products, setProducts] = useState<FakeProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FakeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<number>(6); // Number of products to show initially
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(urlCategory);

  // Initialize with fake data
  useEffect(() => {
    const loadFakeData = () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when backend is ready
        // const productsData = await getAllProducts();
        // setProducts(productsData);
        
        // Using fake data for now
        const fakeData = generateFakeProducts();
        setProducts(fakeData);
        setFilteredProducts(fakeData);
        setError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products');
        // Fallback to fake data even on error
        const fakeData = generateFakeProducts();
        setProducts(fakeData);
        setFilteredProducts(fakeData);
      } finally {
        setLoading(false);
      }
    };

    loadFakeData();
  }, []);

  // Handle URL query parameter - perform search when URL has query param
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlCategory = searchParams.get('category');
    
    // Update category filter from URL
    if (urlCategory) {
      setCategoryFilter(urlCategory);
    } else {
      setCategoryFilter('');
    }
    
    if (products.length > 0) {
      if (urlQuery && urlQuery.trim()) {
        // Perform search if query exists
        setSearchQuery(urlQuery);
        setIsSearching(true);
        // TODO: Replace with actual API search when backend is ready
        // const results = await searchProducts(urlQuery);
        // Filter fake data by search query
        const filtered = products.filter((product) =>
          product.product_name.toLowerCase().includes(urlQuery.toLowerCase()) ||
          product.seller.fullname.toLowerCase().includes(urlQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
        setIsSearching(false);
      } else {
        // Reset to all products if no query
        setSearchQuery('');
        setFilteredProducts(products);
      }
    }
  }, [searchParams, products]);

  // Apply filters and sorting when filter options change
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (product) =>
          product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filter (converting VND to approximate USD for filter)
    // Use buy_now_price if available, otherwise use current_price
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'under50':
          result = result.filter((product) => {
            const price = product.buy_now_price ?? product.current_price;
            return price < 50 * 25000; // ~$50
          });
          break;
        case '50to100':
          result = result.filter((product) => {
            const price = product.buy_now_price ?? product.current_price;
            return price >= 50 * 25000 && price <= 100 * 25000;
          });
          break;
        case '100to200':
          result = result.filter((product) => {
            const price = product.buy_now_price ?? product.current_price;
            return price > 100 * 25000 && price <= 200 * 25000;
          });
          break;
        case 'above200':
          result = result.filter((product) => {
            const price = product.buy_now_price ?? product.current_price;
            return price > 200 * 25000;
          });
          break;
      }
    }

    // Apply category filter if category is selected
    if (categoryFilter) {
      // You can add category-based filtering logic here when category field is available
    }

    setFilteredProducts(result);
  }, [
    priceFilter,
    products,
    searchQuery,
    categoryFilter,
  ]);

  const handleLoadMore = () => {
    setVisibleProducts((prev) => prev + 6); // Load 6 more products
  };

  // Get limited number of products to display
  const displayProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts = filteredProducts.length > visibleProducts;

  return (
    <div>
      <Header />
      
      {/* Search Bar Section */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #EAEAEA',
          py: 2,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <PCPSearchBar />
      </Box>

      <main>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <Link
              to="/category"
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Typography color="text.secondary">Category</Typography>
            </Link>
            <Typography color="text.primary">Products</Typography>
          </Breadcrumbs>

          {/* Page Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 4,
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            Our Products
          </Typography>

          {/* Price Filter */}
          <Box sx={{ mb: 4 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="price-filter-label">Price</InputLabel>
              <Select
                labelId="price-filter-label"
                id="price-filter"
                value={priceFilter}
                label="Price"
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="under50">Under 1.25M VND</MenuItem>
                <MenuItem value="50to100">1.25M - 2.5M VND</MenuItem>
                <MenuItem value="100to200">2.5M - 5M VND</MenuItem>
                <MenuItem value="above200">Above 5M VND</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Products Grid */}
          {loading || isSearching ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ mb: 4 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : displayProducts.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No products found matching your criteria
              </Typography>
            </Paper>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {displayProducts.map((product) => (
                  <Box key={product.id}>
                    <ProductCard {...product} />
                  </Box>
                ))}
              </Box>

              {hasMoreProducts && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 6,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    sx={{
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    Load More
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
