import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getBidHistoriesByProductId, BidHistoryResponse } from '../../../api/bidHistory';

interface TransactionHistoryProps {
  productId?: string | number;
}

export default function TransactionHistory({ productId }: TransactionHistoryProps) {
  const [bidHistories, setBidHistories] = useState<BidHistoryResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Fetch bid histories
  useEffect(() => {
    if (!productId) {
      setBidHistories([]);
      return;
    }

    const fetchBidHistories = async () => {
      try {
        setLoading(true);
        const response = await getBidHistoriesByProductId(productId, page - 1, itemsPerPage);
        
        setBidHistories(response.content);
        setTotalPages(response.totalPages || 1);
      } catch (error: any) {
        console.error('Failed to fetch bid histories:', error);
        toast.error(error.response?.data?.message || 'Failed to load transaction history');
        setBidHistories([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBidHistories();
  }, [productId, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Format date and time
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format price in VND
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        component="h3"
        sx={{
          fontWeight: 800,
          mb: 2,
          color: '#e89b3e',
        }}
      >
        Bid history
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#c3937c' }} />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table sx={{ minWidth: 650 }} aria-label="transaction history table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#EAD9C9' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Bidder</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }} align="right">Price bid (not max price)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bidHistories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#868686' }}>
                      No bidding activities right now
                    </TableCell>
                  </TableRow>
                ) : (
                  bidHistories.map((bidHistory) => (
                    <TableRow
                      key={bidHistory.id}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: '#fafafa',
                        },
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                        },
                      }}
                    >
                      <TableCell sx={{ color: '#333333' }}>
                        {formatDateTime(bidHistory.createdAt)}
                      </TableCell>
                      <TableCell sx={{ color: '#333333' }}>
                        {bidHistory.bidder?.fullname || 'Unknown'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#c3937c', fontWeight: 600 }}>
                        {formatPrice(bidHistory.price)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
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
      )}
    </Box>
  );
}

