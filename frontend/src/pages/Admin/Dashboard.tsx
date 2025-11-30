import React, { useState, useEffect, ComponentType } from 'react';
import AdminLayout from './AdminLayout';
import {
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Button,
  IconButton,
  Tab,
  Tabs,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  XAxis as XAxisOriginal,
  YAxis as YAxisOriginal,
  CartesianGrid,
  Legend as LegendOriginal,
  PieChart as PieChartBase,
  Pie as PieOriginal,
  Cell as CellOriginal,
  AreaChart as AreaChartBase,
  Area as AreaOriginal,
  ResponsiveContainer as ResponsiveContainerBase,
  Tooltip as TooltipOriginal,
} from 'recharts';

// Type assertion to fix the TypeScript error
const XAxis = XAxisOriginal as unknown as React.FC<any>;
const YAxis = YAxisOriginal as unknown as React.FC<any>;

// Fix for ResponsiveContainer type error
type ResponsiveContainerProps = {
  width?: string | number;
  height?: string | number;
  aspect?: number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: number;
  debounce?: number;
  children?: React.ReactNode;
};

// Fix for AreaChart type error
type AreaChartProps = {
  data?: any[];
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children?: React.ReactNode;
  [key: string]: any;
};

// Fix for PieChart type error
type PieChartProps = {
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children?: React.ReactNode;
  [key: string]: any;
};

// Fix for recharts component type errors
type TooltipProps = {
  separator?: string;
  label?: string;
  labelFormatter?: (label: string) => string;
  labelStyle?: object;
  labelType?: string;
  formatter?: (value: number, name: string) => string;
  itemStyle?: object;
  itemSorter?: (item: any) => number;
  itemFormatter?: (item: any) => string;
  cursor?: boolean;
  wrapperStyle?: object;
  offset?: number;
  children?: React.ReactNode;
  [key: string]: any;
};

type LegendProps = {
  verticalAlign?: 'top' | 'middle' | 'bottom';
  align?: 'left' | 'center' | 'right';
  height?: number;
  width?: number;
  layout?: 'horizontal' | 'vertical';
  iconType?: string;
  iconSize?: number;
  children?: React.ReactNode;
  [key: string]: any;
};

type AreaProps = {
  type?: string;
  dataKey: string;
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  activeDot?: object;
  children?: React.ReactNode;
  [key: string]: any;
};

type PieProps = {
  data: any[];
  dataKey: string;
  nameKey?: string;
  cx?: string | number;
  cy?: string | number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  children?: React.ReactNode;
  [key: string]: any;
};

type CellProps = {
  fill?: string;
  [key: string]: any;
};

const AreaChart = (AreaChartBase as unknown) as React.FC<AreaChartProps>;
const ResponsiveContainer = ResponsiveContainerBase as unknown as ComponentType<ResponsiveContainerProps>;
const PieChart = (PieChartBase as unknown) as React.FC<PieChartProps>;
const Tooltip = TooltipOriginal as unknown as React.FC<TooltipProps>;
const Legend = LegendOriginal as unknown as React.FC<LegendProps>;
const Area = AreaOriginal as unknown as React.FC<AreaProps>;
const Pie = PieOriginal as unknown as React.FC<PieProps>;
const Cell = CellOriginal as unknown as React.FC<CellProps>;

import { 
  ShoppingBag, 
  People, 
  CalendarToday, 
  AttachMoney,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Refresh,
  DateRange,
} from '@mui/icons-material';
import { getDashboardStats, getMonthlySales, getTopProducts } from '../../api/admin';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  percentChange?: number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, percentChange, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: 2, 
      borderRadius: 4, 
      overflow: 'hidden',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 8,
      }
    }}>
      <Box sx={{ 
        height: 8, 
        bgcolor: color 
      }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="medium" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {percentChange !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {percentChange >= 0 ? (
                  <ArrowUpward sx={{ color: 'success.main', fontSize: 14, mr: 0.5 }} />
                ) : (
                  <ArrowDownward sx={{ color: 'error.main', fontSize: 14, mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  fontWeight="medium"
                  color={percentChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {percentChange >= 0 ? '+' : ''}{percentChange}% since last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.15),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [period, setPeriod] = useState('30days');
  const [error, setError] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    upcomingAppointments: 0,
    totalRevenue: 0,
    percentChange: {
      orders: 0,
      customers: 0,
      appointments: 0,
      revenue: 0
    }
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = async () => {
    setStatsLoading(true);
    try {
      await fetchDashboardData(period);
    } catch (error) {
      setError({
        show: true,
        message: 'Failed to refresh data. Please try again.',
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchDashboardData(newPeriod);
  };

  const fetchDashboardData = async (selectedPeriod: string) => {
    try {
      setStatsLoading(true);
      
      // Fetch dashboard statistics
      const stats = await getDashboardStats(selectedPeriod);
      setDashboardStats(stats);
      
      // Fetch monthly sales data
      const sales = await getMonthlySales();
      setSalesData(sales);
      
      // Fetch top products
      const products = await getTopProducts();
      setTopProducts(products);
      
      setStatsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError({
        show: true,
        message: 'Failed to load data. Please try again.',
      });
      setStatsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError({ ...error, show: false });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchDashboardData(period);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError({
          show: true,
          message: 'Failed to load dashboard data. Please try again.',
        });
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Fade in={!loading} timeout={800}>
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>Wedding Dress Management</Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's what's happening with your business today.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant={period === '30days' ? 'contained' : 'outlined'} 
                color="primary" 
                startIcon={<DateRange />}
                sx={{ borderRadius: 2 }}
                onClick={() => handlePeriodChange('30days')}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Refresh />}
                sx={{ borderRadius: 2 }}
                onClick={handleRefresh}
                disabled={statsLoading}
              >
                {statsLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
          </Box>

          <Snackbar
            open={error.show}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseError} severity="error">
              {error.message}
            </Alert>
          </Snackbar>

          {statsLoading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Total Orders"
                value={dashboardStats.totalOrders.toString()}
                subtitle="Orders this month"
                icon={<ShoppingBag />}
                color={theme.palette.primary.main}
                percentChange={dashboardStats.percentChange.orders}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Total Customers"
                value={dashboardStats.totalCustomers.toString()}
                subtitle="Active clients"
                icon={<People />}
                color={theme.palette.error.main}
                percentChange={dashboardStats.percentChange.customers}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Upcoming Appointments"
                value={dashboardStats.upcomingAppointments.toString()}
                subtitle="Next 7 days"
                icon={<CalendarToday />}
                color={theme.palette.warning.main}
                percentChange={dashboardStats.percentChange.appointments}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Total Revenue"
                value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
                subtitle="This month"
                icon={<AttachMoney />}
                color={theme.palette.success.main}
                percentChange={dashboardStats.percentChange.revenue}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  mx: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Sales" />
              <Tab label="Products" />
              <Tab label="Customers" />
            </Tabs>
          </Box>

          <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    boxShadow: 2, 
                    height: '100%',
                    borderRadius: 4,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Monthly Sales & Profit
                    </Typography>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={salesData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                      <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
                      />
                      <YAxis 
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
                        domain={[0, 'dataMax + 1000']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: 8, 
                          boxShadow: theme.shadows[3],
                          border: 'none'
                        }}
                        formatter={(value: number, name: string) => `$${value}`}
                      />
                      <Legend 
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        name="Sales" 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke={theme.palette.success.main} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                        name="Profit"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    boxShadow: 2, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 4,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Top Selling Products
                    </Typography>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%' 
                  }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: 8, 
                            boxShadow: theme.shadows[3],
                            border: 'none' 
                          }}
                          formatter={(value: number, name: string) => `${name}: ${value}%`}
                        />
                        <Pie
                          data={topProducts}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          innerRadius={70}
                          paddingAngle={3}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ percent }) => 
                            percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : ''}
                        >
                          {topProducts.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              stroke={theme.palette.background.paper}
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ 
                  p: 3, 
                  boxShadow: 2, 
                  borderRadius: 4,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Orders
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      sx={{ fontWeight: 'medium' }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Stack spacing={2.5}>
                    {salesData.length > 0 ? (
                      <Typography>
                        Order data is available in the orders section
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">
                        No recent orders found
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ 
                  p: 3, 
                  boxShadow: 2, 
                  borderRadius: 4,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      New Customers
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      sx={{ fontWeight: 'medium' }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Stack spacing={2.5}>
                    {dashboardStats.totalCustomers > 0 ? (
                      <Typography>
                        Customer data is available in the customers section
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">
                        No new customers found
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Fade>
    </AdminLayout>
  );
};

export default Dashboard; 