import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid as MuiGrid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Switch,
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  CreditCard,
  LocalShipping,
  AssignmentReturn,
  ReceiptLong,
  Email,
} from '@mui/icons-material';
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  processReturn,
} from '../../api/order';
/**
 * Interface cho đơn hàng trong hệ thống
 */
interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'under-review';
  paymentStatus:
    | 'pending'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  isRental: boolean;
  rentalPeriod?: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Interface cho các sản phẩm trong đơn hàng
 */
interface OrderItem {
  dress: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
  rentalDays?: number;
  purchaseType?: string;
}

// Order statuses for filter and display
const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'info' },
  { value: 'shipped', label: 'Shipped', color: 'secondary' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'returned', label: 'Returned', color: 'default' },
  { value: 'under-review', label: 'Under Review', color: 'info' },
];

// Payment statuses with more options
const PAYMENT_STATUSES = [
  { value: 'all', label: 'All Payments' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'processing', label: 'Processing', color: 'info' },
  { value: 'paid', label: 'Paid', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'error' },
  { value: 'refunded', label: 'Refunded', color: 'default' },
  {
    value: 'partially_refunded',
    label: 'Partially Refunded',
    color: 'secondary',
  },
];

// Order types for filter and display
const ORDER_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'rental', label: 'Rentals' },
  { value: 'buy', label: 'Purchases' },
];

// Custom Grid component to fix compatibility issues with MUI v5
const Grid = (props: any) => {
  return <MuiGrid {...props} />;
};

const Orders = () => {
  // States for managing orders and filtering
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Order detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  // Order status dialog
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');

  // Payment status dialog
  const [updatePaymentStatusDialogOpen, setUpdatePaymentStatusDialogOpen] =
    useState(false);
  const [newPaymentStatus, setNewPaymentStatus] =
    useState<Order['paymentStatus']>('pending');

  // Return processing dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<
    'perfect' | 'good' | 'damaged'
  >('perfect');
  const [damageDescription, setDamageDescription] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [sendPaymentReminder, setSendPaymentReminder] = useState(true);

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách đơn hàng từ backend
      const ordersData = await getAllOrders();

      // Map backend response to our frontend interface
      const mappedOrders: Order[] = Array.isArray(ordersData)
        ? ordersData.map((order) => {
            // Calculate rental days based on start and end dates if available
            let rentalDays = 3; // Default value
            if (order.startDate && order.endDate) {
              rentalDays = calculateRentalDays(order.startDate, order.endDate);
            }

            // Map items with correct rental days
            const items = Array.isArray(order.items)
              ? order.items.map((item: any) => ({
                  dress: {
                    _id: item.dressId || '',
                    name: item.name || 'Unknown Dress',
                  },
                  quantity: item.quantity || 1,
                  price: item.pricePerDay || 0,
                  // Use calculated rental days if not specified directly
                  rentalDays: item.rentalDays || rentalDays,
                  purchaseType: item.purchaseType || 'rental',
                }))
              : [];

            // Calculate correct total from items
            const calculatedTotal = items.reduce(
              (total: number, item: OrderItem) =>
                total + item.price * item.quantity * (item.rentalDays || 1),
              0,
            );

            // Check if we should use the calculated total instead of the one from backend
            const finalTotal = order.totalAmount
              ? Math.abs(calculatedTotal - order.totalAmount) > 0.01
                ? calculatedTotal
                : order.totalAmount
              : calculatedTotal;

            // Properly handle customer information
            const customerName =
              order.userId?.name ||
              (order.userId?.firstName && order.userId?.lastName
                ? `${order.userId.firstName} ${order.userId.lastName}`
                : order.userId?.username ||
                  order.customer?.name ||
                  (order.customer?.firstName && order.customer?.lastName
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : null));

            // Handle shipping address - don't include N/A placeholders if real data is missing
            const hasShippingAddress =
              order.shippingAddress &&
              (order.shippingAddress.street ||
                order.shippingAddress.city ||
                order.shippingAddress.state);

            // Check the purchase type from the items - if any item has purchaseType 'buy', consider the order as a purchase
            const isPurchase = Array.isArray(order.items) && order.items.some(item => item.purchaseType === 'buy');
            const isRental = !isPurchase; // If not a purchase, assume it's a rental

            // Provide default values for potentially missing fields
            return {
              _id: order._id || '',
              orderNumber:
                order.orderNumber ||
                `ORD-${order._id?.substring(0, 6) || '000000'}`,
              customer: {
                _id:
                  order.userId?._id ||
                  order.customer?._id ||
                  (typeof order.userId === 'string' ? order.userId : ''),
                name: customerName || 'Unknown Customer',
                email:
                  order.userId?.email ||
                  order.customer?.email ||
                  'unknown@example.com',
              },
              items,
              totalAmount: finalTotal,
              status: (order.status || 'pending') as Order['status'],
              paymentStatus: (order.paymentStatus ||
                'pending') as Order['paymentStatus'],
              createdAt: order.createdAt || new Date().toISOString(),
              shippingAddress: hasShippingAddress
                ? {
                    street: order.shippingAddress.street || '',
                    city: order.shippingAddress.city || '',
                    state: order.shippingAddress.state || '',
                    zipCode: order.shippingAddress.zipCode || '',
                    country: order.shippingAddress.country || '',
                  }
                : {
                    street: 'N/A',
                    city: 'N/A',
                    state: 'N/A',
                    zipCode: 'N/A',
                    country: 'N/A',
                  },
              trackingNumber: order.trackingNumber,
              isRental, // Set based on the purchase type check
              rentalPeriod:
                order.startDate && order.endDate
                  ? {
                      startDate: new Date(order.startDate).toISOString(),
                      endDate: new Date(order.endDate).toISOString(),
                    }
                  : undefined,
            };
          })
        : [];

      console.log('Mapped orders:', mappedOrders);
      setOrders(mappedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders from server');
      setOrders([]); // Set empty array to avoid undefined errors
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch orders when component mounts
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders when filters change
    let result = [...orders];

    // Apply search filter
    if (searchTerm && result.length > 0) {
      result = result.filter((order) => {
        return (
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (filterStatus !== 'all' && result.length > 0) {
      result = result.filter((order) => order.status === filterStatus);
    }

    // Apply payment status filter
    if (filterPaymentStatus !== 'all' && result.length > 0) {
      result = result.filter(
        (order) => order.paymentStatus === filterPaymentStatus,
      );
    }

    // Apply type filter
    if (filterType !== 'all' && result.length > 0) {
      if (filterType === 'rental') {
        result = result.filter((order) => order.isRental === true);
      } else if (filterType === 'buy') {
        result = result.filter((order) => order.isRental === false);
      }
    }

    // Update filtered orders
    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, filterPaymentStatus, filterType]);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleOpenUpdateStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateStatusDialogOpen(true);
  };

  const handleOpenUpdatePaymentStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewPaymentStatus(order.paymentStatus);
    setUpdatePaymentStatusDialogOpen(true);
  };

  // Open return processing dialog
  const handleOpenReturnDialog = (order: Order) => {
    setSelectedOrder(order);
    setReturnCondition('perfect');
    setDamageDescription('');
    setAdditionalCharges(0);
    setSendPaymentReminder(true);
    setReturnDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      // Call the API to update the order status
      await updateOrderStatus(selectedOrder._id, newStatus);

      // Update the local state with the updated order
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: newStatus }
            : order,
        ),
      );

      // Update filtered orders as well
      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: newStatus }
            : order,
        ),
      );

      // Set success message
      setSuccessMessage(
        `Order status updated to "${ORDER_STATUSES.find((s) => s.value === newStatus)?.label}"`,
      );

      // Close the dialog
      setUpdateStatusDialogOpen(false);

      // Handle automatic payment status changes based on order status
      let updatedPaymentStatus: Order['paymentStatus'] | null = null;

      // For rental orders
      if (selectedOrder.isRental) {
        if (newStatus === 'pending') {
          updatedPaymentStatus = 'pending';
        } else if (newStatus === 'under-review' || newStatus === 'confirmed') {
          // If a rental is confirmed, it means at least the deposit is paid
          if (selectedOrder.paymentStatus === 'pending') {
            updatedPaymentStatus = 'processing'; // Deposit paid (50%)
          }
        } else if (newStatus === 'delivered') {
          // When delivered for rentals, payment status should remain as processing (50% deposit)
          if (selectedOrder.paymentStatus === 'pending') {
            updatedPaymentStatus = 'processing'; // Set to deposit paid if not already
          }
          // For rentals, full payment is only marked after return
        } else if (newStatus === 'cancelled') {
          // If cancelled, handle refund based on current payment status
          if (selectedOrder.paymentStatus === 'paid') {
            updatedPaymentStatus = 'refunded';
          } else if (selectedOrder.paymentStatus === 'processing') {
            updatedPaymentStatus = 'partially_refunded'; // Refund deposit
          }
        }
      }
      // For purchase orders
      else {
        if (newStatus === 'confirmed' || newStatus === 'shipped') {
          // Purchases are typically paid in full when confirmed or shipped
          if (selectedOrder.paymentStatus === 'pending') {
            updatedPaymentStatus = 'processing';
          }
        } else if (newStatus === 'delivered') {
          // For purchases, automatically mark as fully paid when delivered
          if (selectedOrder.paymentStatus !== 'paid') {
            updatedPaymentStatus = 'paid';
          }
        } else if (newStatus === 'cancelled') {
          // Handle refund for purchases
          if (selectedOrder.paymentStatus === 'paid') {
            updatedPaymentStatus = 'refunded';
          }
        }
      }

      // Update payment status if needed
      if (updatedPaymentStatus) {
        try {
          await updatePaymentStatus(selectedOrder._id, updatedPaymentStatus);

          // Update orders in state
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === selectedOrder._id
                ? { ...order, paymentStatus: updatedPaymentStatus }
                : order,
            ),
          );

          // Update filtered orders as well
          setFilteredOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === selectedOrder._id
                ? { ...order, paymentStatus: updatedPaymentStatus }
                : order,
            ),
          );

          setSuccessMessage(
            `Order status updated to "${ORDER_STATUSES.find((s) => s.value === newStatus)?.label}" and payment status updated to "${PAYMENT_STATUSES.find((s) => s.value === updatedPaymentStatus)?.label}"`,
          );
        } catch (error) {
          console.error('Failed to update payment status:', error);
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedOrder) return;

    try {
      setProcessingAction(true);
      await updatePaymentStatus(selectedOrder._id, newPaymentStatus);

      // Update orders in state
      setOrders(
        orders.map((order) => {
          if (order._id === selectedOrder._id) {
            return { ...order, paymentStatus: newPaymentStatus };
          }
          return order;
        }),
      );

      setFilteredOrders(
        filteredOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            return { ...order, paymentStatus: newPaymentStatus };
          }
          return order;
        }),
      );

      // Generate appropriate success message based on order type and payment status
      let paymentMessage = `Payment status for order ${selectedOrder.orderNumber} updated to ${PAYMENT_STATUSES.find((s) => s.value === newPaymentStatus)?.label}`;

      if (selectedOrder.isRental) {
        if (newPaymentStatus === 'processing') {
          paymentMessage = `Deposit payment recorded for rental order ${selectedOrder.orderNumber}`;
        } else if (newPaymentStatus === 'paid') {
          paymentMessage = `Full payment recorded for rental order ${selectedOrder.orderNumber}`;
        } else if (newPaymentStatus === 'refunded') {
          paymentMessage = `Full refund processed for rental order ${selectedOrder.orderNumber}`;
        } else if (newPaymentStatus === 'partially_refunded') {
          paymentMessage = `Deposit refunded for rental order ${selectedOrder.orderNumber}`;
        }
      } else {
        // For purchase orders
        if (newPaymentStatus === 'paid') {
          paymentMessage = `Full payment recorded for purchase order ${selectedOrder.orderNumber}`;
        } else if (newPaymentStatus === 'refunded') {
          paymentMessage = `Purchase refunded for order ${selectedOrder.orderNumber}`;
        }
      }

      setUpdatePaymentStatusDialogOpen(false);
      setSuccessMessage(paymentMessage);
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
    } finally {
      setProcessingAction(false);
    }
  };

  // Process return with condition assessment
  const handleProcessReturn = async () => {
    if (!selectedOrder) return;

    try {
      setProcessingAction(true);

      const returnData = {
        condition: returnCondition,
        damageDescription:
          returnCondition === 'damaged' ? damageDescription : undefined,
        additionalCharges:
          additionalCharges > 0 ? additionalCharges : undefined,
        sendPaymentReminder,
      };

      await processReturn(selectedOrder._id, returnData);

      // Update orders in state
      setOrders(
        orders.map((order) => {
          if (order._id === selectedOrder._id) {
            // For rentals, when returned, update status to returned
            // If sendPaymentReminder is true, it means remaining payment is still due
            // If sendPaymentReminder is false, it means remaining payment has been collected
            return {
              ...order,
              status: 'returned',
              paymentStatus: sendPaymentReminder
                ? 'processing' // Still in processing if payment reminder sent (50% paid)
                : 'paid', // Mark as fully paid if payment collected
            };
          }
          return order;
        }),
      );

      // Update filtered orders as well
      setFilteredOrders(
        filteredOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            return {
              ...order,
              status: 'returned',
              paymentStatus: sendPaymentReminder
                ? 'processing' // Still in processing if payment reminder sent (50% paid)
                : 'paid', // Mark as fully paid if payment collected
            };
          }
          return order;
        }),
      );

      setReturnDialogOpen(false);

      const successMsg = sendPaymentReminder
        ? `Return processed for order ${selectedOrder.orderNumber}. Payment reminder sent to customer for remaining 50%.`
        : `Return processed and full payment collected for order ${selectedOrder.orderNumber}.`;

      setSuccessMessage(successMsg);
    } catch (err: any) {
      setError(err.message || 'Failed to process return');
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };

  const getPaymentStatusColor = (status: string) => {
    const paymentStatus = PAYMENT_STATUSES.find((s) => s.value === status);
    return paymentStatus?.color || 'default';
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end.getTime() - start.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1; // Include both start and end days
  };

  const renderGridComponent = () => {
    return (
      <Box sx={{ flexGrow: 1 }}>
        {/* Header and Statistics */}
        <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" fontWeight="bold">
                Order Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                View and manage all customer orders
              </Typography>
            </Grid>

            {/* Statistics Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {orders.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography
                    variant="h3"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    {orders.filter((o) => o.status === 'pending').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Processing
                  </Typography>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {orders.filter((o) => o.status === 'confirmed').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Revenue
                  </Typography>
                  <Typography
                    variant="h3"
                    color="success.main"
                    fontWeight="bold"
                  >
                    $
                    {orders
                      .filter(
                        (order) =>
                          order.paymentStatus === 'paid' &&
                          order.status !== 'cancelled',
                      )
                      .reduce((sum, order) => sum + order.totalAmount, 0)
                      .toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Search and Filters */}
        <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by order #, customer name, email, or tracking #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ color: 'action.active', mr: 1 }} />
                  ),
                }}
                size="small"
                sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment</InputLabel>
                <Select
                  value={filterPaymentStatus}
                  label="Payment"
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {ORDER_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Orders Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow
                      key={order._id}
                      hover
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.customer.name !== 'Unknown Customer'
                          ? order.customer.name
                          : order.customer.email}
                      </TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.isRental ? 'Rental' : 'Buy'}
                          size="small"
                          color={order.isRental ? 'primary' : 'default'}
                          sx={{
                            fontWeight: 'medium',
                            minWidth: 80,
                            justifyContent: 'center',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)
                          }
                          size="small"
                          color={getStatusColor(order.status) as any}
                          sx={{
                            fontWeight: 'medium',
                            minWidth: 80,
                            justifyContent: 'center',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Chip
                            label={
                              PAYMENT_STATUSES.find(
                                (s) => s.value === order.paymentStatus,
                              )?.label || order.paymentStatus
                            }
                            color={
                              getPaymentStatusColor(order.paymentStatus) as any
                            }
                            size="small"
                            sx={{
                              fontWeight: 'medium',
                              minWidth: 80,
                              justifyContent: 'center',
                            }}
                          />
                          {order.isRental && order.paymentStatus === 'paid' && (
                            <Chip
                              label="100% Paid"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem' }}
                            />
                          )}
                          {order.isRental &&
                            order.paymentStatus === 'processing' && (
                              <Chip
                                label="50% Paid"
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem' }}
                              />
                            )}
                          {!order.isRental &&
                            order.paymentStatus === 'paid' && (
                              <Chip
                                label="Paid"
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem' }}
                              />
                            )}
                          {order.status === 'cancelled' &&
                            order.paymentStatus !== 'refunded' && (
                              <Chip
                                label="Pending Refund"
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ fontSize: '0.65rem' }}
                              />
                            )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <ButtonGroup size="small" aria-label="order actions">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewOrder(order)}
                            size="small"
                            title="View order details"
                            sx={{ borderRadius: '4px 0 0 4px' }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleOpenUpdateStatusDialog(order)}
                            size="small"
                            title="Update order status"
                            sx={{ borderRadius: '0' }}
                          >
                            <LocalShipping />
                          </IconButton>
                          {[
                            'confirmed',
                            'shipped',
                            'delivered',
                            'cancelled',
                            'returned',
                          ].includes(order.status) && (
                            <IconButton
                              color="warning"
                              onClick={() =>
                                handleOpenUpdatePaymentStatusDialog(order)
                              }
                              size="small"
                              title="Update payment status"
                              sx={{
                                borderRadius:
                                  order.isRental && order.status === 'delivered'
                                    ? '0'
                                    : '0 4px 4px 0',
                              }}
                            >
                              <CreditCard />
                            </IconButton>
                          )}
                          {order.isRental && order.status === 'delivered' && (
                            <IconButton
                              color="secondary"
                              onClick={() => handleOpenReturnDialog(order)}
                              size="small"
                              title="Process dress return"
                              sx={{ borderRadius: '0 4px 4px 0' }}
                            >
                              <AssignmentReturn />
                            </IconButton>
                          )}
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography variant="h6" color="text.secondary">
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create a new order or change search criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
            />
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  const renderOrderDetailDialog = () => {
    if (!selectedOrder) return null;

    // Calculate the correct total based on items and rental days
    // Get rental days from rental period if available
    let effectiveRentalDays = 3; // Default
    if (selectedOrder.rentalPeriod) {
      effectiveRentalDays = calculateRentalDays(
        selectedOrder.rentalPeriod.startDate,
        selectedOrder.rentalPeriod.endDate,
      );
    }

    // Recalculate item totals with corrected rental days
    const updatedItems = selectedOrder.items.map((item) => ({
      ...item,
      rentalDays: item.rentalDays || effectiveRentalDays,
    }));

    // Calculate correct total
    const calculatedTotal = updatedItems.reduce(
      (total, item) =>
        total +
        (item.price || 0) * (item.quantity || 1) * (item.rentalDays || 1),
      0,
    );

    // Check if there's a discrepancy in the total
    const hasDiscrepancy =
      Math.abs(calculatedTotal - selectedOrder.totalAmount) > 0.01;

    // Determine if shipping section should be shown
    const hasShippingInfo =
      selectedOrder.shippingAddress &&
      (selectedOrder.shippingAddress.street !== 'N/A' ||
        selectedOrder.shippingAddress.city !== 'N/A' ||
        selectedOrder.shippingAddress.state !== 'N/A');

    // Extract customer ID or name for better display
    const customerIdDisplay = `Customer #${selectedOrder.customer._id.substring(0, 6)}`;
    const customerNameDisplay =
      selectedOrder.customer.name !== 'Unknown Customer'
        ? selectedOrder.customer.name
        : customerIdDisplay;

    // Calculate payment information based on order type
    const isRental = selectedOrder.isRental;
    const isPaid = selectedOrder.paymentStatus === 'paid';
    const isProcessing = selectedOrder.paymentStatus === 'processing';
    const isReturned = selectedOrder.status === 'returned';

    // For rentals: display deposit and remaining amount
    const depositAmount = isRental ? selectedOrder.totalAmount / 2 : 0;
    const remainingAmount = isRental ? selectedOrder.totalAmount / 2 : 0;
    const showRemainingPayment = isRental && isProcessing;

    return (
      <Dialog
        open={orderDetailOpen}
        onClose={() => setOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle
              sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', pb: 1 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5">
                  Order #{selectedOrder.orderNumber}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {isRental && (
                    <Chip label="Rental" color="primary" size="small" />
                  )}
                  {!isRental && (
                    <Chip label="Buy" color="default" size="small" />
                  )}
                  <Chip
                    label={
                      selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)
                    }
                    color={getStatusColor(selectedOrder.status) as any}
                    size="small"
                  />
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Customer Information
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customerNameDisplay}
                        </Typography>
                        <Typography variant="body2">
                          {selectedOrder.customer.email}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Order Date
                        </Typography>
                        <Typography>
                          {formatDate(selectedOrder.createdAt)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Status
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={
                              PAYMENT_STATUSES.find(
                                (s) => s.value === selectedOrder.paymentStatus,
                              )?.label || selectedOrder.paymentStatus
                            }
                            color={
                              getPaymentStatusColor(
                                selectedOrder.paymentStatus,
                              ) as any
                            }
                            size="small"
                          />
                          {isRental && (
                            <Typography variant="body2" color="text.secondary">
                              {selectedOrder.paymentStatus === 'pending' &&
                                'No payment received'}
                              {selectedOrder.paymentStatus === 'processing' &&
                                '50% deposit paid'}
                              {selectedOrder.paymentStatus === 'paid' &&
                                '100% payment complete'}
                              {selectedOrder.paymentStatus === 'refunded' &&
                                'Payment refunded'}
                              {selectedOrder.paymentStatus ===
                                'partially_refunded' && 'Deposit refunded'}
                            </Typography>
                          )}
                          {!isRental &&
                            <Typography variant="body2" color="text.secondary">
                              {selectedOrder.paymentStatus === 'pending' &&
                                'Payment pending'}
                              {selectedOrder.paymentStatus === 'paid' && 'Fully paid'}
                            </Typography>
                          }
                        </Stack>
                      </Box>

                      {/* Display payment breakdown for rentals */}
                      {isRental && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Payment Breakdown
                          </Typography>
                          <Box
                            sx={{
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              p: 1.5,
                              borderRadius: 1,
                              mt: 1,
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            <Typography variant="body2">
                              Total: ${selectedOrder.totalAmount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              Deposit (50%): ${depositAmount.toFixed(2)}
                              {isProcessing && ' - Paid'}
                              {isPaid && ' - Paid'}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: showRemainingPayment
                                  ? 'bold'
                                  : 'normal',
                                color: showRemainingPayment
                                  ? 'primary.main'
                                  : 'text.primary',
                              }}
                            >
                              Remaining (50%): ${remainingAmount.toFixed(2)}
                              {isProcessing &&
                                !isReturned &&
                                ' - Due after return'}
                              {isPaid && ' - Paid'}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                    <Stack spacing={2}>
                      {/* Only show shipping section if relevant */}
                      {(hasShippingInfo ||
                        selectedOrder.status === 'shipped' ||
                        selectedOrder.status === 'delivered') && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Shipping Address
                          </Typography>
                          {hasShippingInfo ? (
                            <Typography>
                              {selectedOrder.shippingAddress.street},{' '}
                              {selectedOrder.shippingAddress.city},{' '}
                              {selectedOrder.shippingAddress.state}{' '}
                              {selectedOrder.shippingAddress.zipCode},{' '}
                              {selectedOrder.shippingAddress.country}
                            </Typography>
                          ) : (
                            <Typography color="text.secondary">
                              No shipping address provided
                            </Typography>
                          )}
                        </Box>
                      )}

                      {selectedOrder.trackingNumber && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Tracking Number
                          </Typography>
                          <Typography>
                            {selectedOrder.trackingNumber}
                          </Typography>
                        </Box>
                      )}

                      {/* Only show shipping duration when order is shipped or delivered */}
                      {(selectedOrder.status === 'shipped' ||
                        selectedOrder.status === 'delivered') && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Shipping Duration
                          </Typography>
                          <Typography>3 days</Typography>
                        </Box>
                      )}

                      {selectedOrder.isRental && selectedOrder.rentalPeriod && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Rental Period
                          </Typography>
                          <Stack direction="column" spacing={0.5}>
                            <Typography>
                              {formatDate(selectedOrder.rentalPeriod.startDate)}{' '}
                              - {formatDate(selectedOrder.rentalPeriod.endDate)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {effectiveRentalDays} days total
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Rental Days</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {updatedItems.map(
                            (item: OrderItem, index: number) => (
                              <TableRow
                                key={index}
                                sx={{
                                  '&:nth-of-type(odd)': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                  },
                                }}
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {item.dress?.name || 'Unnamed Product'}
                                  </Typography>
                                  {item.rentalDays && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Rental: {item.rentalDays} days
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {item.quantity || 1}
                                </TableCell>
                                <TableCell align="right">
                                  ${(item.price || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                  {item.rentalDays || effectiveRentalDays}
                                </TableCell>
                                <TableCell align="right">
                                  $
                                  {(
                                    (item.price || 0) *
                                    (item.quantity || 1) *
                                    (item.rentalDays || effectiveRentalDays)
                                  ).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell
                              colSpan={5}
                              align="right"
                              sx={{ fontWeight: 'bold' }}
                            >
                              Total:
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 'bold' }}
                            >
                              ${calculatedTotal.toFixed(2)}
                              {hasDiscrepancy && (
                                <Typography
                                  variant="caption"
                                  color="error"
                                  display="block"
                                >
                                  Corrected from $
                                  {selectedOrder.totalAmount.toFixed(2)}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Order Status Timeline
                    </Typography>
                    <Stepper
                      sx={{ mt: 2 }}
                      activeStep={
                        selectedOrder.status === 'cancelled'
                          ? -1
                          : selectedOrder.status === 'pending'
                            ? 0
                            : selectedOrder.status === 'under-review'
                              ? 1
                              : selectedOrder.status === 'confirmed'
                                ? 2
                                : selectedOrder.status === 'shipped'
                                  ? 3
                                  : selectedOrder.status === 'delivered'
                                    ? 4
                                    : selectedOrder.status === 'returned'
                                      ? 5
                                      : 0
                      }
                    >
                      <Step completed={selectedOrder.status !== 'pending'}>
                        <StepLabel>Pending</StepLabel>
                      </Step>
                      <Step
                        completed={
                          selectedOrder.status === 'under-review' ||
                          [
                            'confirmed',
                            'shipped',
                            'delivered',
                            'returned',
                          ].includes(selectedOrder.status)
                        }
                      >
                        <StepLabel>Under Review</StepLabel>
                      </Step>
                      <Step
                        completed={[
                          'confirmed',
                          'shipped',
                          'delivered',
                          'returned',
                        ].includes(selectedOrder.status)}
                      >
                        <StepLabel>Confirmed</StepLabel>
                      </Step>
                      <Step
                        completed={
                          selectedOrder.status === 'shipped' ||
                          selectedOrder.status === 'delivered' ||
                          selectedOrder.status === 'returned'
                        }
                      >
                        <StepLabel>Shipped</StepLabel>
                      </Step>
                      <Step
                        completed={
                          selectedOrder.status === 'delivered' ||
                          selectedOrder.status === 'returned'
                        }
                      >
                        <StepLabel>Delivered</StepLabel>
                      </Step>
                      <Step completed={selectedOrder.status === 'returned'}>
                        <StepLabel>Returned</StepLabel>
                      </Step>
                      {selectedOrder.status === 'cancelled' && (
                        <Step completed={true}>
                          <StepLabel error>Cancelled</StepLabel>
                        </Step>
                      )}
                    </Stepper>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', px: 3, py: 2 }}
            >
              <Button
                onClick={() => setOrderDetailOpen(false)}
                variant="outlined"
              >
                Close
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOrderDetailOpen(false);
                  handleOpenUpdateStatusDialog(selectedOrder);
                }}
                startIcon={<Edit />}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    );
  };

  return (
    <AdminLayout>
      {loading && orders.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        renderGridComponent()
      )}

      {renderOrderDetailDialog()}

      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusDialogOpen}
        onClose={() => setUpdateStatusDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', pb: 1 }}
        >
          {newStatus === 'confirmed'
            ? 'Confirm Order'
            : newStatus === 'shipped'
              ? 'Ship Order'
              : newStatus === 'delivered'
                ? 'Mark as Delivered'
                : newStatus === 'cancelled'
                  ? 'Cancel Order'
                  : newStatus === 'returned'
                    ? 'Return Order'
                    : newStatus === 'under-review'
                      ? 'Set to Under Review'
                      : 'Update Order Status'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            {newStatus === 'confirmed'
              ? `Are you sure you want to confirm order ${selectedOrder?.orderNumber}?`
              : newStatus === 'shipped'
                ? `Are you sure you want to mark order ${selectedOrder?.orderNumber} as shipped?`
                : newStatus === 'delivered'
                  ? `Are you sure you want to mark order ${selectedOrder?.orderNumber} as delivered?`
                  : newStatus === 'cancelled'
                    ? `Are you sure you want to cancel order ${selectedOrder?.orderNumber}? This cannot be undone.`
                    : newStatus === 'returned'
                      ? `Are you sure you want to mark order ${selectedOrder?.orderNumber} as returned?`
                      : newStatus === 'under-review'
                        ? `Are you sure you want to mark order ${selectedOrder?.orderNumber} as under review?`
                        : `Update the status for order ${selectedOrder?.orderNumber}`}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value as Order['status'])}
            >
              {/* Display statuses in order processing sequence */}
              {[
                'pending',
                'under-review',
                'confirmed',
                'shipped',
                'delivered',
                'returned',
                'cancelled',
              ].map((statusValue) => {
                const status = ORDER_STATUSES.find(
                  (s) => s.value === statusValue,
                );
                if (!status) return null;
                return (
                  <MenuItem key={status.value} value={status.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor:
                            status.color === 'default'
                              ? '#9e9e9e'
                              : status.color === 'warning'
                                ? '#ff9800'
                                : status.color === 'error'
                                  ? '#f44336'
                                  : status.color === 'success'
                                    ? '#4caf50'
                                    : status.color === 'info'
                                      ? '#2196f3'
                                      : status.color === 'secondary'
                                        ? '#9c27b0'
                                        : '#9e9e9e',
                          mr: 1,
                        }}
                      />
                      {status.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', px: 3, py: 2 }}
        >
          <Button
            onClick={() => setUpdateStatusDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color={
              newStatus === 'confirmed'
                ? 'info'
                : newStatus === 'delivered'
                  ? 'success'
                  : newStatus === 'cancelled'
                    ? 'error'
                    : newStatus === 'returned'
                      ? 'secondary'
                      : 'primary'
            }
          >
            {newStatus === 'confirmed'
              ? 'Confirm Order'
              : newStatus === 'delivered'
                ? 'Mark as Delivered'
                : newStatus === 'cancelled'
                  ? 'Cancel Order'
                  : newStatus === 'returned'
                    ? 'Mark as Returned'
                    : newStatus === 'under-review'
                      ? 'Set Under Review'
                      : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Payment Status Dialog */}
      <Dialog
        open={updatePaymentStatusDialogOpen}
        onClose={() =>
          !processingAction && setUpdatePaymentStatusDialogOpen(false)
        }
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', pb: 1 }}
        >
          {selectedOrder?.isRental
            ? 'Update Rental Payment Status'
            : 'Update Purchase Payment Status'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedOrder?.isRental
              ? `Update rental payment status for order ${selectedOrder?.orderNumber}`
              : `Update purchase payment status for order ${selectedOrder?.orderNumber}`}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={newPaymentStatus}
              label="Payment Status"
              onChange={(e) =>
                setNewPaymentStatus(e.target.value as Order['paymentStatus'])
              }
              disabled={processingAction}
            >
              {/* Filter payment status options based on rental/purchase */}
              {PAYMENT_STATUSES.filter((s) => s.value !== 'all')
                .filter((s) => {
                  // For rentals, show all payment statuses
                  if (selectedOrder?.isRental) return true;
                  // For purchases, hide partially_refunded and processing (typically used for deposits)
                  return (
                    s.value !== 'partially_refunded' && s.value !== 'processing'
                  );
                })
                .map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor:
                            status.color === 'default'
                              ? '#9e9e9e'
                              : status.color === 'warning'
                                ? '#ff9800'
                                : status.color === 'error'
                                  ? '#f44336'
                                  : status.color === 'success'
                                    ? '#4caf50'
                                    : status.color === 'info'
                                      ? '#2196f3'
                                      : status.color === 'secondary'
                                        ? '#9c27b0'
                                        : '#9e9e9e',
                          mr: 1,
                        }}
                      />
                      {status.label}
                      {selectedOrder?.isRental &&
                        status.value === 'processing' &&
                        ' (Deposit Paid)'}
                      {selectedOrder?.isRental &&
                        status.value === 'partially_refunded' &&
                        ' (Deposit Refunded)'}
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', px: 3, py: 2 }}
        >
          <Button
            onClick={() => setUpdatePaymentStatusDialogOpen(false)}
            variant="outlined"
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePaymentStatus}
            variant="contained"
            color="primary"
            disabled={processingAction}
          >
            {processingAction ? (
              <CircularProgress size={24} />
            ) : (
              'Update Payment Status'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Return Dialog */}
      <Dialog
        open={returnDialogOpen}
        onClose={() => !processingAction && setReturnDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, maxWidth: 550 },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <AssignmentReturn sx={{ mr: 1 }} />
          Process Dress Return
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 3 }}>
            Process the return for order {selectedOrder?.orderNumber}. Assess
            the condition of the returned dress and collect the remaining
            payment.
          </DialogContentText>

          {/* Condition Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Dress Condition</InputLabel>
            <Select
              value={returnCondition}
              label="Dress Condition"
              onChange={(e) =>
                setReturnCondition(
                  e.target.value as 'perfect' | 'good' | 'damaged',
                )
              }
              disabled={processingAction}
            >
              <MenuItem value="perfect">Perfect - Like New</MenuItem>
              <MenuItem value="good">Good - Minor Wear</MenuItem>
              <MenuItem value="damaged">Damaged - Requires Repair</MenuItem>
            </Select>
          </FormControl>

          {/* Damage Description (only if damaged) */}
          {returnCondition === 'damaged' && (
            <TextField
              label="Damage Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
              disabled={processingAction}
              sx={{ mb: 3 }}
              placeholder="Describe the damage in detail..."
            />
          )}

          {/* Additional Charges */}
          <TextField
            label="Additional Charges (if any)"
            variant="outlined"
            fullWidth
            type="number"
            value={additionalCharges}
            onChange={(e) => setAdditionalCharges(Number(e.target.value))}
            disabled={processingAction}
            InputProps={{
              startAdornment: <span style={{ marginRight: 8 }}>$</span>,
            }}
            sx={{ mb: 3 }}
          />

          {/* Remaining Payment Section */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: '#f8f3f0',
              borderRadius: 1,
              border: '1px solid #c3937c',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: '#c3937c',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ReceiptLong sx={{ mr: 0.5, fontSize: 20 }} />
              Remaining Payment
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Customer has paid 50% deposit ($
              {selectedOrder
                ? (selectedOrder.totalAmount / 2).toFixed(2)
                : '0.00'}
              ). Remaining payment: $
              {selectedOrder
                ? (selectedOrder.totalAmount / 2 + additionalCharges).toFixed(2)
                : '0.00'}
              {additionalCharges > 0 &&
                ` (includes $${additionalCharges.toFixed(2)} additional charges)`}
            </Typography>
            <FormControl
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Email sx={{ mr: 0.5, fontSize: 16, color: '#c3937c' }} />
                Send payment reminder email:
              </Typography>
              <Switch
                checked={sendPaymentReminder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSendPaymentReminder(e.target.checked)
                }
                disabled={processingAction}
                color="secondary"
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', px: 3, py: 2 }}
        >
          <Button
            onClick={() => setReturnDialogOpen(false)}
            variant="outlined"
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcessReturn}
            variant="contained"
            color="secondary"
            disabled={
              processingAction ||
              (returnCondition === 'damaged' && damageDescription.trim() === '')
            }
            startIcon={
              processingAction ? (
                <CircularProgress size={20} />
              ) : (
                <AssignmentReturn />
              )
            }
          >
            Process Return
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default Orders;
