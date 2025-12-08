import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  Pagination,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ThumbUp as ThumbUpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Interfaces
interface Bidder {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
  email: string;
  bidAmount: number;
  bidAt: string;
  bidCount: number;
  hasReview: boolean;
  rating?: number; // Rating from 1-10
  reviewText?: string;
  isBlocked?: boolean;
}

interface BidderManagementProps {
  productId: string;
  isSeller: boolean;
}

// Generate fake bidders for demonstration
const generateFakeBidders = () => {
  const fakeReviewedBidders: Bidder[] = [
    {
      id: '1',
      username: 'nguyenvana',
      fullname: 'Nguyễn Văn A',
      avatar: '/placeholder-user.jpg',
      email: 'nguyenvana@example.com',
      bidAmount: 2500000,
      bidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 5,
      hasReview: true,
      rating: 8.5,
      reviewText: 'Reliable buyer, paid on time',
      isBlocked: false,
    },
    {
      id: '2',
      username: 'tranthib',
      fullname: 'Trần Thị B',
      avatar: '/placeholder-user.jpg',
      email: 'tranthib@example.com',
      bidAmount: 3200000,
      bidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 12,
      hasReview: true,
      rating: 3.0,
      reviewText: 'Did not pay after winning auction',
      isBlocked: true,
    },
    {
      id: '3',
      username: 'levanc',
      fullname: 'Lê Văn C',
      avatar: '/placeholder-user.jpg',
      email: 'levanc@example.com',
      bidAmount: 1800000,
      bidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 8,
      hasReview: true,
      rating: 9.2,
      reviewText: 'Quick and pleasant transaction',
      isBlocked: false,
    },
    {
      id: '6',
      username: 'vothif',
      fullname: 'Võ Thị F',
      avatar: '/placeholder-user.jpg',
      email: 'vothif@example.com',
      bidAmount: 2900000,
      bidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 7,
      hasReview: true,
      rating: 7.0,
      reviewText: 'Stable, normal transaction',
      isBlocked: false,
    },
    {
      id: '7',
      username: 'vothidfg',
      fullname: 'Võ Thịsdf',
      avatar: '/placeholder-user.jpg',
      email: 'vothif@example.com',
      bidAmount: 29034500,
      bidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 7,
      hasReview: true,
      rating: 8.0,
      reviewText: 'Stable, normal transaction',
      isBlocked: false,
    },
    {
      id: '8',
      username: 'vothidfjjg',
      fullname: 'Võ Thịjjsdf',
      avatar: '/placeholder-user.jpg',
      email: 'vothif@example.com',
      bidAmount: 29034500,
      bidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 7,
      hasReview: true,
      rating: 8.0,
      reviewText: 'Stable, normal transaction',
      isBlocked: false,
    },
    {
      id: '9',
      username: 'vothidfgsd',
      fullname: 'Võ Thịsdff',
      avatar: '/placeholder-user.jpg',
      email: 'vothif@example.com',
      bidAmount: 29034500,
      bidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 7,
      hasReview: true,
      rating: 8.0,
      reviewText: 'Stable, normal transaction',
      isBlocked: false,
    },
  ];

  const fakeUnreviewedBidders: Bidder[] = [
    {
      id: '4',
      username: 'phamthid',
      fullname: 'Phạm Thị D',
      avatar: '/placeholder-user.jpg',
      email: 'phamthid@example.com',
      bidAmount: 2100000,
      bidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 3,
      hasReview: false,
      isBlocked: true,
    },
    {
      id: '5',
      username: 'hoangvane',
      fullname: 'Hoàng Văn E',
      avatar: '/placeholder-user.jpg',
      email: 'hoangvane@example.com',
      bidAmount: 2800000,
      bidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 15,
      hasReview: false,
      isBlocked: false,
    },
    {
      id: '7',
      username: 'dangvang',
      fullname: 'Đặng Văn G',
      avatar: '/placeholder-user.jpg',
      email: 'dangvang@example.com',
      bidAmount: 3500000,
      bidAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      bidCount: 20,
      hasReview: false,
      isBlocked: false,
    },
    {
      id: '8',
      username: 'buithih',
      fullname: 'Bùi Thị H',
      avatar: '/placeholder-user.jpg',
      email: 'buithih@example.com',
      bidAmount: 2300000,
      bidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 4,
      hasReview: false,
      isBlocked: false,
    },
    {
      id: '9',
      username: 'dovani',
      fullname: 'Đỗ Văn I',
      avatar: '/placeholder-user.jpg',
      email: 'dovani@example.com',
      bidAmount: 3100000,
      bidAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      bidCount: 9,
      hasReview: false,
      isBlocked: false,
    },
    {
      id: '10',
      username: 'ngothij',
      fullname: 'Ngô Thị J',
      avatar: '/placeholder-user.jpg',
      email: 'ngothij@example.com',
      bidAmount: 2600000,
      bidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 6,
      hasReview: false,
      isBlocked: false,
    },
    {
      id: '11',
      username: 'lyvankkk',
      fullname: 'Lý Văn K',
      avatar: '/placeholder-user.jpg',
      email: 'lyvank@example.com',
      bidAmount: 3300000,
      bidAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      bidCount: 11,
      hasReview: false,
      isBlocked: false,
    },
  ];

  return { fakeReviewedBidders, fakeUnreviewedBidders };
};

export default function BidderManagement({ productId, isSeller }: BidderManagementProps): JSX.Element {
  // Initialize with mock data immediately
  const mockData = generateFakeBidders();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [reviewedBidders, setReviewedBidders] = useState<Bidder[]>(mockData.fakeReviewedBidders);
  const [unreviewedBidders, setUnreviewedBidders] = useState<Bidder[]>(mockData.fakeUnreviewedBidders);
  const [loading, setLoading] = useState<boolean>(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState<boolean>(false);
  const [allowDialogOpen, setAllowDialogOpen] = useState<boolean>(false);
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [blockReason, setBlockReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Pagination states
  const [reviewedPage, setReviewedPage] = useState<number>(1);
  const [unreviewedPage, setUnreviewedPage] = useState<number>(1);
  const itemsPerPage = 5;

  console.log('BidderManagement rendered:', {
    isSeller,
    productId,
    reviewedCount: reviewedBidders.length,
    unreviewedCount: unreviewedBidders.length
  });

  // Fetch bidders data (optional - will try to fetch real data but keep mock data if fails)
  useEffect(() => {
    if (!isSeller) return;

    fetchBidders();
  }, [productId, isSeller]);

  const fetchBidders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/product/${productId}/bidders`, {
        withCredentials: true,
      });

      if (response.data && response.data.success) {
        const bidders = response.data.data;

        // Separate reviewed and unreviewed bidders
        const reviewed = bidders.filter((b: Bidder) => b.hasReview);
        const unreviewed = bidders.filter((b: Bidder) => !b.hasReview);

        setReviewedBidders(reviewed);
        setUnreviewedBidders(unreviewed);
      }
    } catch (error: any) {
      console.log('Using mock data for bidders (API not available)');
      // Keep the mock data that was initialized in useState
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Open block dialog
  const handleBlockClick = (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setBlockReason('');
    setBlockDialogOpen(true);
  };

  // Open allow dialog
  const handleAllowClick = (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setAllowDialogOpen(true);
  };

  // Block bidder
  const handleBlockBidder = async () => {
    if (!selectedBidder) return;

    try {
      setActionLoading(true);
      await axios.post(
        `${API_URL}/product/${productId}/block-bidder`,
        {
          bidderId: selectedBidder.id,
          reason: blockReason,
        },
        { withCredentials: true }
      );

      toast.success(`User ${selectedBidder.fullname} has been blocked`);

      // Remove blocked bidder from the list (they won't be displayed anymore)
      if (currentTab === 0) {
        setReviewedBidders(prev =>
          prev.filter(b => b.id !== selectedBidder.id)
        );
      } else {
        setUnreviewedBidders(prev =>
          prev.filter(b => b.id !== selectedBidder.id)
        );
      }

      setBlockDialogOpen(false);
      setSelectedBidder(null);
      setBlockReason('');
    } catch (error: any) {
      console.error('Error blocking bidder:', error);
      toast.error(error.response?.data?.message || 'Unable to block user');
    } finally {
      setActionLoading(false);
    }
  };

  // Allow bidder
  const handleAllowBidder = async () => {
    if (!selectedBidder) return;

    try {
      setActionLoading(true);
      await axios.post(
        `${API_URL}/product/${productId}/allow-bidder`,
        { bidderId: selectedBidder.id },
        { withCredentials: true }
      );

      toast.success(`User ${selectedBidder.fullname} has been allowed to participate in auction`);

      setAllowDialogOpen(false);
      setSelectedBidder(null);
    } catch (error: any) {
      console.error('Error allowing bidder:', error);
      toast.error(error.response?.data?.message || 'Unable to allow user');
    } finally {
      setActionLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render bidder table
  const renderBidderTable = (bidders: Bidder[], showReview: boolean = false, isUnreviewedTab: boolean = false) => {
    // Filter out blocked bidders - they should not be displayed
    const activeBidders = bidders.filter(b => !b.isBlocked);

    // Pagination
    const currentPage = isUnreviewedTab ? unreviewedPage : reviewedPage;
    const totalPages = Math.ceil(activeBidders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBidders = activeBidders.slice(startIndex, endIndex);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
      if (isUnreviewedTab) {
        setUnreviewedPage(value);
      } else {
        setReviewedPage(value);
      }
    };

    if (activeBidders.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No bidders yet
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Bidder</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Bid Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Time</TableCell>
                {showReview && (
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Review</TableCell>
                )}
                <TableCell align="center" sx={{ fontWeight: 600, color: '#333333' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBidders.map((bidder) => (
                <TableRow key={bidder.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={bidder.avatar}
                        alt={bidder.fullname}
                        sx={{ width: 40, height: 40 }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333333' }}>
                          {bidder.fullname}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#868686' }}>
                          @{bidder.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#c3937c' }}>
                      {formatCurrency(bidder.bidAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#868686' }}>
                      {formatDate(bidder.bidAt)}
                    </Typography>
                  </TableCell>
                  {showReview && (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {bidder.rating !== undefined ? (
                          <Tooltip title={bidder.reviewText || ''}>
                            <Chip
                              label={`${bidder.rating}/10`}
                              size="small"
                              sx={{
                                bgcolor: '#EAD9C9',
                                color: '#c3937c',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#868686' }}>
                            No review
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell align="center">
                    {isUnreviewedTab ? (
                      <Tooltip title="Allow bidding">
                        <IconButton
                          onClick={() => handleAllowClick(bidder)}
                          sx={{
                            color: '#c3937c',
                            '&:hover': { bgcolor: '#EAD9C9' },
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Block user">
                        <IconButton
                          onClick={() => handleBlockClick(bidder)}
                          sx={{
                            color: '#c3937c',
                            '&:hover': { bgcolor: '#EAD9C9' },
                          }}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination - same style as Transaction History */}
        {activeBidders.length > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#333333',
                  '&.Mui-selected': {
                    backgroundColor: '#EAD9C9',
                    color: '#333333',
                    '&:hover': {
                      backgroundColor: '#EAD9C9',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                },
              }}
            />
          </Box>
        )}
      </>
    );
  };

  // If not seller, don't show this component
  // COMMENTED OUT FOR TESTING - Always show component
  // if (!isSeller) {
  //   return <></>;
  // }

  console.log('BidderManagement - About to render, isSeller:', isSeller);

  return (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: '#333333',
          mb: 3,
        }}
      >
        Bidder Management
      </Typography>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: '#868686',
              '&.Mui-selected': {
                color: '#333333',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#c3937c',
              height: 3,
            },
          }}
        >
          <Tab
            label={`Reviewed (${reviewedBidders.filter(b => !b.isBlocked).length})`}
            icon={<ThumbUpIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label={`Not Reviewed (${unreviewedBidders.filter(b => !b.isBlocked).length})`}
            icon={<PersonIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#c3937c' }} />
            </Box>
          ) : (
            <>
              {currentTab === 0 && (
                <>
                  <Alert
                    severity="info"
                    sx={{
                      mb: 3,
                      '& .MuiAlert-icon': {
                        color: '#a67c66',
                      },
                      backgroundColor: '#f9f6f4',
                      border: '1px solid #d8c1b2',
                      borderRadius: '10px',
                      color: '#5e4538',
                    }}
                  >
                    These bidders have been reviewed from previous transactions. You can
                    block them if you don't want them to participate in this product's auction.
                  </Alert>
                  {renderBidderTable(reviewedBidders, true, false)}
                </>
              )}

              {currentTab === 1 && (
                <>
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 3,
                      '& .MuiAlert-icon': {
                        color: '#a67c66',
                      },
                      backgroundColor: '#f9f6f4',
                      border: '1px solid #d8c1b2',
                      borderRadius: '10px',
                      color: '#5e4538',
                    }}
                  >
                    These bidders have not been reviewed yet. You can allow them to participate
                    in this product's auction.
                  </Alert>
                  {renderBidderTable(unreviewedBidders, false, true)}
                </>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Block Dialog */}
      <Dialog
        open={blockDialogOpen}
        onClose={() => !actionLoading && setBlockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#333333' }}>
          Block User
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#868686' }}>
            Are you sure you want to block <strong>{selectedBidder?.fullname}</strong> from this
            product? They will no longer be able to bid on this product.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBlockDialogOpen(false)}
            disabled={actionLoading}
            sx={{
              color: '#868686',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBlockBidder}
            disabled={actionLoading}
            variant="contained"
            startIcon={actionLoading ? <CircularProgress size={16} /> : <BlockIcon />}
            sx={{
              bgcolor: '#c3937c',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#b08268',
              },
            }}
          >
            {actionLoading ? 'Processing...' : 'Block User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allow Dialog */}
      <Dialog
        open={allowDialogOpen}
        onClose={() => !actionLoading && setAllowDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#333333' }}>
          Allow User
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#868686' }}>
            Are you sure you want to allow <strong>{selectedBidder?.fullname}</strong> to participate in the auction
            for this product? They will be able to place bids on this product.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setAllowDialogOpen(false)}
            disabled={actionLoading}
            sx={{
              color: '#868686',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAllowBidder}
            disabled={actionLoading}
            variant="contained"
            startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            sx={{
              bgcolor: '#c3937c',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#b08268',
              },
            }}
          >
            {actionLoading ? 'Processing...' : 'Allow'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

