import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import ProductCard, { type ProductCardProps } from '../../components/ProductCard';
import { getAllUserWishlist, removeFromWishlist, type WishlistResponse } from '../../api/wishlist';
import { getProductByIdFromMain, type ProductResponseFromAPI } from '../../api/product';
import { getUserProfile as getProfileFromNewApi } from '../../api/profileApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interface for wishlist item with product data
interface WishlistItemWithProduct {
  wishlistId: number;
  productId: number;
  product: ProductResponseFromAPI;
  createdAt: string;
}

export default function WatchListPage(): JSX.Element {
  const [userData, setUserData] = useState<any>(null);
  const [watchlistItems, setWatchlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get user profile from new API
        const profile = await getProfileFromNewApi();
        setUserData(profile);
        
        // Get wishlist items
        const wishlistResponse = await getAllUserWishlist();
        
        // Fetch product details for each wishlist item
        const itemsWithProducts = await Promise.all(
          wishlistResponse.map(async (wishlistItem: WishlistResponse) => {
            try {
              const product = await getProductByIdFromMain(wishlistItem.productId);
              return {
                wishlistId: wishlistItem.id,
                productId: wishlistItem.productId,
                product: product,
                createdAt: wishlistItem.createdAt,
              };
            } catch (err) {
              console.error(`Error fetching product ${wishlistItem.productId}:`, err);
              return null;
            }
          })
        );
        
        // Filter out null items (failed to fetch)
        const validItems = itemsWithProducts.filter(
          (item): item is WishlistItemWithProduct => item !== null
        );
        
        setWatchlistItems(validItems);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast.error(err.message || 'Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemoveFromWatchlist = async (productId: number) => {
    try {
      setRemovingIds(prev => new Set(prev).add(productId));
      await removeFromWishlist(productId);
      setWatchlistItems(prev => prev.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi watchlist');
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      toast.error(err.message || 'Failed to remove from watchlist');
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Convert ProductResponseFromAPI to ProductCardProps
  const convertToProductCardProps = (product: ProductResponseFromAPI): ProductCardProps => {
    return {
      id: product.id,
      productName: product.productName,
      thumbnailUrl: product.thumbnailUrl,
      seller: {
        id: product.seller.id,
        avatar: product.seller.avatar || null,
        fullname: product.seller.fullname,
      },
      buyNowPrice: product.buyNowPrice,
      minimumBidStep: product.minimumBidStep,
      startAt: new Date(product.createdAt),
      endAt: new Date(product.endAt),
      currentPrice: product.currentPrice,
      topBidder: product.topBidder ? {
        id: product.topBidder.id,
        avatar: product.topBidder.avatar || null,
        fullname: product.topBidder.fullname,
      } : null,
      createdAt: new Date(product.createdAt),
      bidCount: product.bidCount,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <CircularProgress />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="watchlist"
              userName={userData?.email || 'User'}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <Card sx={{ bgcolor: '#fff', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Heart className="h-8 w-8" style={{ color: '#FFE082' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      Watch List
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Danh sách các sản phẩm bạn đã thêm vào watchlist
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {watchlistItems.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  Watchlist trống
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bạn chưa thêm sản phẩm nào vào watchlist. Hãy khám phá và thêm các sản phẩm yêu thích!
                </Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {watchlistItems.map((item) => {
                  const productCardProps = convertToProductCardProps(item.product);
                  const isRemoving = removingIds.has(item.productId);

                  return (
                    <Box 
                      key={item.wishlistId}
                      sx={{ 
                        position: 'relative',
                      }}
                    >
                      <ProductCard {...productCardProps} />
                      <IconButton
                        onClick={() => handleRemoveFromWatchlist(item.productId)}
                        disabled={isRemoving}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                          },
                          zIndex: 10,
                        }}
                        size="small"
                      >
                        {isRemoving ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Trash2 className="h-5 w-5 text-red-500" />
                        )}
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

