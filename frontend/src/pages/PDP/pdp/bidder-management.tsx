import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Pagination,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ThumbUp as ThumbUpIcon,
  Person as PersonIcon,
  BlockOutlined as BlockListIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import {
  getBlackListByProductId,
  BlackListResponse,
  getAutoBidsByProductId,
  getBidRequestsByProductId,
  AutoBidItem,
  BidRequestItem,
  blockUser,
  verifyBidRequest,
} from '../../../api/bidderManagement';

// Interfaces
interface Bidder {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
  bidAt: string;
  hasReview: boolean;
  rating?: number; // Rating from 1-10
  reviewText?: string;
  isBlocked?: boolean;
}

interface BidderManagementProps {
  productId: string;
  isSeller: boolean;
}

export default function BidderManagement({ productId, isSeller }: BidderManagementProps): JSX.Element {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [reviewedBidders, setReviewedBidders] = useState<Bidder[]>([]);
  const [unreviewedBidders, setUnreviewedBidders] = useState<Bidder[]>([]);
  const [blackList, setBlackList] = useState<BlackListResponse[]>([]);
  const [blackListTotalPages, setBlackListTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [blackListLoading, setBlackListLoading] = useState<boolean>(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState<boolean>(false);
  const [allowDialogOpen, setAllowDialogOpen] = useState<boolean>(false);
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Pagination states
  const [reviewedPage, setReviewedPage] = useState<number>(1);
  const [reviewedTotalPages, setReviewedTotalPages] = useState<number>(1);
  const [unreviewedPage, setUnreviewedPage] = useState<number>(1);
  const [unreviewedTotalPages, setUnreviewedTotalPages] = useState<number>(1);
  const [blackListPage, setBlackListPage] = useState<number>(1);
  const itemsPerPage = 5;

  console.log('BidderManagement rendered:', {
    isSeller,
    productId,
    reviewedCount: reviewedBidders.length,
    unreviewedCount: unreviewedBidders.length
  });

  // Fetch data for current tab
  useEffect(() => {
    if (!isSeller) return;

    if (currentTab === 0) {
      fetchInBidding();
    } else if (currentTab === 1) {
      fetchRequestToBid();
    }
  }, [productId, isSeller, currentTab, reviewedPage, unreviewedPage]);

  // Fetch blacklist data when tab changes to blacklist
  useEffect(() => {
    if (!isSeller || currentTab !== 2) return;

    fetchBlackList();
  }, [productId, isSeller, currentTab, blackListPage]);

  const mapAutoBidToBidder = (item: AutoBidItem): Bidder => ({
    id: item.bidder.id.toString(),
    username: `user_${item.bidder.id}`,
    fullname: item.bidder.fullname,
    avatar: item.bidder.avatar || '/placeholder-user.jpg',
    bidAt: item.createdAt,
    hasReview: true,
    rating: item.bidder.assessment ?? undefined,
    reviewText: undefined,
    isBlocked: false,
  });

  const mapBidRequestToBidder = (item: BidRequestItem): Bidder => ({
    id: item.bidder.id.toString(),
    username: `user_${item.bidder.id}`,
    fullname: item.bidder.fullname,
    avatar: item.bidder.avatar || '/placeholder-user.jpg',
    bidAt: item.createdAt,
    hasReview: false,
    rating: item.bidder.assessment ?? undefined,
    reviewText: item.verified ? 'Verified request' : undefined,
    isBlocked: false,
  });

  const fetchInBidding = async () => {
    try {
      setLoading(true);
      const response = await getAutoBidsByProductId(productId, reviewedPage - 1, itemsPerPage);
      setReviewedBidders(response.content.map(mapAutoBidToBidder));
      setReviewedTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch in-bidding bidders:', error);
      toast.error(error.response?.data?.message || 'Failed to load in-bidding bidders');
      setReviewedBidders([]);
      setReviewedTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestToBid = async () => {
    try {
      setLoading(true);
      const response = await getBidRequestsByProductId(productId, unreviewedPage - 1, itemsPerPage);
      setUnreviewedBidders(response.content.map(mapBidRequestToBidder));
      setUnreviewedTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch request-to-bid bidders:', error);
      toast.error(error.response?.data?.message || 'Failed to load request-to-bid bidders');
      setUnreviewedBidders([]);
      setUnreviewedTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlackList = async () => {
    try {
      setBlackListLoading(true);
      const response = await getBlackListByProductId(productId, blackListPage - 1, itemsPerPage);
      setBlackList(response.content || []);
      setBlackListTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch blacklist:', error);
      setBlackList([]);
      setBlackListTotalPages(1);
    } finally {
      setBlackListLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // Fetch blacklist when switching to blacklist tab
    if (newValue === 2) {
      fetchBlackList();
    }
  };

  // Open block dialog
  const handleBlockClick = (bidder: Bidder) => {
    setSelectedBidder(bidder);
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
      await blockUser({
        bidderId: parseInt(selectedBidder.id, 10),
        productId: typeof productId === 'string' ? parseInt(productId, 10) : productId,
      });

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
      await verifyBidRequest({
        bidderId: parseInt(selectedBidder.id, 10),
        productId: typeof productId === 'string' ? parseInt(productId, 10) : productId,
      });

      toast.success(`User ${selectedBidder.fullname} has been allowed to participate in auction`);

      // Refresh the list to update verified status
      if (currentTab === 1) {
        fetchRequestToBid();
      }

      setAllowDialogOpen(false);
      setSelectedBidder(null);
    } catch (error: any) {
      console.error('Error allowing bidder:', error);
      toast.error(error.response?.data?.message || 'Unable to allow user');
    } finally {
      setActionLoading(false);
    }
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

    // Pagination controlled by backend
    const currentPage = isUnreviewedTab ? unreviewedPage : reviewedPage;
    const totalPages = isUnreviewedTab ? unreviewedTotalPages : reviewedTotalPages;

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
              {activeBidders.map((bidder) => (
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
                        {!isUnreviewedTab && (
                          <Typography
                            variant="caption"
                            onClick={() => navigate(`/reviews/user/${bidder.id}`)}
                            sx={{
                              color: '#8B4513',
                              fontStyle: 'italic',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              '&:hover': {
                                color: '#654321',
                              },
                            }}
                          >
                            see detailed views
                          </Typography>
                        )}
                      </Box>
                    </Box>
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
                              label={`${typeof bidder.rating === 'number' ? bidder.rating.toFixed(2) : bidder.rating}/10`}
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

        {/* Pagination - backend based */}
        {totalPages > 1 && (
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

  // Render blacklist table
  const renderBlackListTable = (totalPages: number = 1) => {
    if (blackListLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#c3937c' }} />
        </Box>
      );
    }

    if (blackList.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No blacklisted bidders
          </Typography>
        </Box>
      );
    }

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
      setBlackListPage(value);
    };

    return (
      <>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Bidder</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Time (Be Banned)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Bidder Ban (Created By)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blackList.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={item.bidder.avatar || '/placeholder-user.jpg'}
                        alt={item.bidder.fullname}
                        sx={{ width: 40, height: 40 }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333333' }}>
                          {item.bidder.fullname}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#868686' }}>
                      {formatDate(item.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#333333' }}>
                      User ID: {item.createdBy}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={blackListPage}
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
            label={`In Bidding (${reviewedBidders.filter(b => !b.isBlocked).length})`}
            icon={<ThumbUpIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label={`Request to Bid (${unreviewedBidders.filter(b => !b.isBlocked).length})`}
            icon={<PersonIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label={`Black List (${blackList.length})`}
            icon={<BlockListIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 2 ? (
            <>
              <Alert
                severity="error"
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
                These bidders have been banned from participating in this product's auction.
              </Alert>
              {renderBlackListTable(blackListTotalPages)}
            </>
          ) : loading ? (
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
                  {renderBidderTable(unreviewedBidders, true, true)}
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

