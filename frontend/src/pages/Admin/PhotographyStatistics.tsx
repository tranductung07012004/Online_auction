import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Button,
  IconButton,
  Snackbar,
  Alert,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  CameraAlt, 
  CheckCircle, 
  Cancel, 
  Schedule, 
  Done,
  MoreVert,
  Search
} from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  getPhotographyBookingStatistics, 
  updatePhotographyBookingStatus, 
  getAllPhotographyBookings,
  PhotographyBookingStatistics, 
  PhotographyBooking 
} from '../../api/admin';
import AdminLayout from './AdminLayout';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Status color mapping
const statusColors = {
  'Pending': '#FFC107',
  'Confirmed': '#4CAF50',
  'Cancelled': '#F44336',
  'Completed': '#2196F3'
};

// Available status options
const statusOptions = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

// Month names
const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const PhotographyStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<PhotographyBookingStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for status menu
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Add state for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Add state for pagination and search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBookings, setFilteredBookings] = useState<PhotographyBooking[]>([]);
  const [allBookings, setAllBookings] = useState<PhotographyBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch statistics function
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await getPhotographyBookingStatistics();
      setStatistics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bookings
  const fetchAllBookings = async () => {
    try {
      setLoadingBookings(true);
      const bookings = await getAllPhotographyBookings();
      setAllBookings(bookings);
      setFilteredBookings(bookings);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách đơn đặt chụp',
        severity: 'error'
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchAllBookings();
  }, []);

  // Filter bookings based on search query
  useEffect(() => {
    if (allBookings.length > 0) {
      if (searchQuery.trim() === '') {
        // If search is empty, use all bookings
        setFilteredBookings(allBookings);
      } else {
        // Otherwise filter by customer name
        const filtered = allBookings.filter(booking => {
          const customerName = booking.customerId?.name || booking.customerId?.email || '';
          return customerName.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setFilteredBookings(filtered);
      }
      setPage(0); // Reset to first page when search changes
    }
  }, [allBookings, searchQuery]);

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Prepare data for status chart
  const prepareStatusChartData = () => {
    if (!statistics) return null;

    const statusData = {
      labels: Object.keys(statistics.bookingsByStatus),
      datasets: [
        {
          data: Object.values(statistics.bookingsByStatus),
          backgroundColor: Object.keys(statistics.bookingsByStatus).map(
            status => statusColors[status as keyof typeof statusColors] || '#999'
          ),
          borderWidth: 1,
        },
      ],
    };

    return statusData;
  };

  // Prepare data for package type chart
  const preparePackageTypeChartData = () => {
    if (!statistics) return null;

    const packageData = {
      labels: statistics.bookingsByPackageType.map(item => item._id),
      datasets: [
        {
          data: statistics.bookingsByPackageType.map(item => item.count),
          backgroundColor: [
            '#8884d8',
            '#82ca9d',
            '#ffc658',
            '#ff8042',
            '#0088FE',
          ],
          borderWidth: 1,
        },
      ],
    };

    return packageData;
  };

  // Prepare data for monthly bookings chart
  const prepareMonthlyChartData = () => {
    if (!statistics) return null;

    // Create an array with all months initialized to 0
    const monthlyData = Array(12).fill(0);
    
    // Fill in the actual data
    statistics.bookingsByMonth.forEach(item => {
      const monthIndex = item._id - 1; // MongoDB month index starts at 1
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex] = item.count;
      }
    });

    const data = {
      labels: monthNames,
      datasets: [
        {
          label: 'Số lượng đặt chụp',
          data: monthlyData,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Schedule sx={{ color: statusColors.Pending }} />;
      case 'Confirmed':
        return <CheckCircle sx={{ color: statusColors.Confirmed }} />;
      case 'Cancelled':
        return <Cancel sx={{ color: statusColors.Cancelled }} />;
      case 'Completed':
        return <Done sx={{ color: statusColors.Completed }} />;
      default:
        return undefined;
    }
  };

  // Handle opening the status menu
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, bookingId: string) => {
    setStatusMenuAnchorEl(event.currentTarget);
    setSelectedBookingId(bookingId);
  };

  // Handle closing the status menu
  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
    setSelectedBookingId(null);
  };

  // Handle changing booking status
  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedBookingId) return;
    
    try {
      await updatePhotographyBookingStatus(selectedBookingId, newStatus);
      
      // Close menu
      handleStatusMenuClose();
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Trạng thái đơn đặt chụp đã được cập nhật thành ${newStatus}`,
        severity: 'success'
      });
      
      // Refresh data
      fetchStatistics();
      fetchAllBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật trạng thái đơn đặt chụp',
        severity: 'error'
      });
    }
  };

  // Handle closing snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Box sx={{ py: 3 }}>
          <Typography color="error" align="center">{error}</Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Thống kê đơn đặt chụp ảnh
        </Typography>

        {/* Overview Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2">Tổng số đơn đặt</Typography>
                    <Typography variant="h4">{statistics?.totalBookings || 0}</Typography>
                  </div>
                  <CameraAlt fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ bgcolor: statusColors.Pending, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2">Đơn chờ xác nhận</Typography>
                    <Typography variant="h4">{statistics?.bookingsByStatus?.Pending || 0}</Typography>
                  </div>
                  <Schedule fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ bgcolor: statusColors.Confirmed, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2">Đơn đã xác nhận</Typography>
                    <Typography variant="h4">{statistics?.bookingsByStatus?.Confirmed || 0}</Typography>
                  </div>
                  <CheckCircle fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ bgcolor: statusColors.Cancelled, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2">Đơn bị hủy</Typography>
                    <Typography variant="h4">{statistics?.bookingsByStatus?.Cancelled || 0}</Typography>
                  </div>
                  <Cancel fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ bgcolor: statusColors.Completed, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="body2">Đơn hoàn thành</Typography>
                    <Typography variant="h4">{statistics?.bookingsByStatus?.Completed || 0}</Typography>
                  </div>
                  <Done fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          {/* Monthly Bookings Chart */}
          <Box sx={{ flex: '1 1 60%', minWidth: '300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Số lượng đặt chụp theo tháng
              </Typography>
              <Box height={300}>
                {prepareMonthlyChartData() && (
                  <Bar 
                    data={prepareMonthlyChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Box>

          {/* Status Distribution Chart */}
          <Box sx={{ flex: '1 1 30%', minWidth: '300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Trạng thái đơn đặt chụp
              </Typography>
              <Box height={300}>
                {prepareStatusChartData() && (
                  <Pie 
                    data={prepareStatusChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Box>

          {/* Package Type Distribution Chart */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Loại gói chụp ảnh
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                {preparePackageTypeChartData() && (
                  <Pie 
                    data={preparePackageTypeChartData()!} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Box>

          {/* Average Info */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Trung bình đặt chụp
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Trung bình đặt chụp mỗi tháng
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    {statistics?.avgBookingsPerMonth ? Math.round(statistics.avgBookingsPerMonth * 10) / 10 : 0}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ đơn hoàn thành
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {statistics?.totalBookings && statistics.bookingsByStatus?.Completed
                      ? `${Math.round((statistics.bookingsByStatus.Completed / statistics.totalBookings) * 100)}%`
                      : '0%'
                    }
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Recent Bookings */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Danh sách đơn đặt chụp
            </Typography>
            <TextField
              placeholder="Tìm kiếm theo tên khách hàng"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Gói chụp</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Ngày chụp</TableCell>
                  <TableCell>Địa điểm</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingBookings ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          {booking.customerId?.name || booking.customerId?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {booking.serviceId?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell>{formatDate(booking.shootingDate)}</TableCell>
                        <TableCell>{booking.shootingLocation}</TableCell>
                        <TableCell>
                          <Chip
                            {...(getStatusIcon(booking.status) && { icon: getStatusIcon(booking.status) })}
                            label={booking.status}
                            sx={{
                              bgcolor: `${statusColors[booking.status as keyof typeof statusColors]}20`,
                              color: statusColors[booking.status as keyof typeof statusColors],
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleStatusMenuOpen(e, booking._id)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {searchQuery
                        ? 'Không tìm thấy đơn đặt chụp nào phù hợp'
                        : 'Không có đơn đặt chụp nào'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredBookings.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count !== -1 ? count : 'nhiều hơn ' + to}`}
          />
        </Paper>
      </Box>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
          Thay đổi trạng thái
        </Typography>
        <Divider />
        {statusOptions.map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleChangeStatus(status)}
            sx={{
              '&:hover': {
                bgcolor: `${statusColors[status as keyof typeof statusColors]}20`,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(status)}
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1,
                  color: statusColors[status as keyof typeof statusColors],
                  fontWeight: 'medium'
                }}
              >
                {status}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default PhotographyStatistics;
