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
} from '@mui/material';
import { useState, useMemo } from 'react';

interface Transaction {
  id: number;
  timestamp: string; // ISO date string
  buyer: string; // Partially masked name from backend
  price: number; // Price in VND
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

// Fake data for testing - more data for pagination
const fakeTransactions: Transaction[] = [
  {
    id: 1,
    timestamp: '2024-01-15T14:30:00',
    buyer: 'Nguyễn Văn A***',
    price: 1500000,
  },
  {
    id: 2,
    timestamp: '2024-01-14T10:15:00',
    buyer: 'Trần Thị B***',
    price: 1450000,
  },
  {
    id: 3,
    timestamp: '2024-01-13T16:45:00',
    buyer: 'Lê Văn C***',
    price: 1400000,
  },
  {
    id: 4,
    timestamp: '2024-01-12T09:20:00',
    buyer: 'Phạm Thị D***',
    price: 1350000,
  },
  {
    id: 5,
    timestamp: '2024-01-11T11:30:00',
    buyer: 'Hoàng Văn E***',
    price: 1300000,
  },
  {
    id: 6,
    timestamp: '2024-01-10T15:00:00',
    buyer: 'Lý Văn F***',
    price: 1250000,
  },
  {
    id: 7,
    timestamp: '2024-01-09T13:20:00',
    buyer: 'Đỗ Thị G***',
    price: 1200000,
  },
  {
    id: 8,
    timestamp: '2024-01-08T08:45:00',
    buyer: 'Bùi Văn H***',
    price: 1180000,
  },
  {
    id: 9,
    timestamp: '2024-01-07T17:30:00',
    buyer: 'Vũ Thị I***',
    price: 1150000,
  },
  {
    id: 10,
    timestamp: '2024-01-06T12:15:00',
    buyer: 'Đinh Văn J***',
    price: 1120000,
  },
  {
    id: 11,
    timestamp: '2024-01-05T14:00:00',
    buyer: 'Ngô Thị K***',
    price: 1100000,
  },
  {
    id: 12,
    timestamp: '2024-01-04T09:30:00',
    buyer: 'Dương Văn L***',
    price: 1080000,
  },
  {
    id: 13,
    timestamp: '2024-01-03T16:20:00',
    buyer: 'Võ Thị M***',
    price: 1050000,
  },
  {
    id: 14,
    timestamp: '2024-01-02T11:45:00',
    buyer: 'Lưu Văn N***',
    price: 1020000,
  },
  {
    id: 15,
    timestamp: '2024-01-01T10:00:00',
    buyer: 'Hồ Thị O***',
    price: 1000000,
  },
];

export default function TransactionHistory({ transactions = fakeTransactions }: TransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transactions.slice(startIndex, endIndex);
  }, [transactions, page]);

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
        Lịch sử giao dịch
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table sx={{ minWidth: 650 }} aria-label="transaction history table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#EAD9C9' }}>
              <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Thời điểm</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333333' }}>Người mua</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333333' }} align="right">Giá</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#868686' }}>
                  Chưa có giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
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
                    {formatDateTime(transaction.timestamp)}
                  </TableCell>
                  <TableCell sx={{ color: '#333333' }}>
                    {transaction.buyer}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#c3937c', fontWeight: 600 }}>
                    {formatPrice(transaction.price)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {transactions.length > itemsPerPage && (
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
    </Box>
  );
}

