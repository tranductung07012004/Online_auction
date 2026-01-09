import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ProductCard, { ProductCardProps } from '../../components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { searchProductsFromMain } from '../../api/search';
import { ProductResponseFromAPI } from '../../api/product';
import { PCPSearchBar } from './pcp/PCPSearchBar';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Pagination,
} from '@mui/material';
import { useSearchSync } from '../../hooks/useSearchSync';

// Map ProductResponseFromAPI to ProductCardProps
const mapProductToCardProps = (product: ProductResponseFromAPI): ProductCardProps => {
  return {
    id: product.id,
    productName: product.productName,
    thumbnailUrl: product.thumbnailUrl,
    seller: {
      id: product.seller.id,
      avatar: product.seller.avatar,
      fullname: product.seller.fullname,
    },
    buyNowPrice: product.buyNowPrice,
    minimumBidStep: product.minimumBidStep,
    endAt: product.endAt,
    currentPrice: product.currentPrice,
    topBidder: product.topBidder ? {
      id: product.topBidder.id,
      avatar: product.topBidder.avatar,
      fullname: product.topBidder.fullname,
    } : null,
    createdAt: product.createdAt,
    bidCount: product.bidCount,
  };
};

export default function ProductPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  
  // Sync search store with URL
  useSearchSync();
  
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSort = searchParams.get('sort') || '';
  
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const productsPerPage = 6; // Number of products per page

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Parse category from URL (should be category id as string)
        const categoryIds: number[] = [];
        if (urlCategory) {
          const categoryId = parseInt(urlCategory, 10);
          if (!isNaN(categoryId)) {
            categoryIds.push(categoryId);
          }
        }

        const sortString = urlSort || "endAt,asc"; // Use urlSort or default

        // Call search API
        const response = await searchProductsFromMain({
          keyword: urlQuery || undefined,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
          page: currentPage - 1, // API uses 0-based page
          size: productsPerPage,
          sort: sortString,
        });

        // Map products to ProductCardProps
        const mappedProducts = response.content.map(mapProductToCardProps);
        setProducts(mappedProducts);
        setTotalPages(response.totalPages);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [urlQuery, urlCategory, urlSort, currentPage, productsPerPage]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search params change
  useEffect(() => {
    setCurrentPage(1);
  }, [urlQuery, urlCategory, urlSort]);

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

          {/* Products Grid */}
          {loading ? (
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
          ) : products.length === 0 ? (
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
                {products.map((product) => (
                  <Box key={product.id}>
                    <ProductCard {...product} />
                  </Box>
                ))}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 6,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#8B6F47',
                        '&.Mui-selected': {
                          backgroundColor: '#EAD9C9',
                          color: '#8B6F47',
                          '&:hover': {
                            backgroundColor: '#EAD9C9',
                            opacity: 0.8,
                          },
                        },
                        '&:hover': {
                          backgroundColor: '#EAD9C9',
                          opacity: 0.6,
                        },
                      },
                    }}
                  />
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
