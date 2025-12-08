import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface MonthlySalesData {
  month: string;
  sales: number;
  orders: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [salesData, setSalesData] = useState<MonthlySalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API calls later
    const mockStats: DashboardStats = {
      totalProducts: 156,
      totalUsers: 2450,
      totalOrders: 5230,
      totalRevenue: 125000000,
    };

    const mockSalesData: MonthlySalesData[] = [
      { month: "Jan", sales: 4000000, orders: 120 },
      { month: "Feb", sales: 3000000, orders: 98 },
      { month: "Mar", sales: 2000000, orders: 75 },
      { month: "Apr", sales: 2780000, orders: 89 },
      { month: "May", sales: 1890000, orders: 62 },
      { month: "Jun", sales: 2390000, orders: 78 },
    ];

    setStats(mockStats);
    setSalesData(mockSalesData);
    setLoading(false);
  }, []);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
  }> = ({ icon, label, value, color }) => (
    <Card
      sx={{
        height: "100%",
        minHeight: { xs: 120, sm: 140, md: 160 },
        display: "flex",
        alignItems: "center",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 50, sm: 60 },
              height: { xs: 50, sm: 60 },
              borderRadius: "50%",
              backgroundColor: `${color}20`,
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ width: "100%" }}>
            <Typography
              color="textSecondary"
              variant="body2"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
              }}
            >
              {typeof value === "number" && label.includes("Revenue")
                ? `${(value / 1000000).toFixed(1)}M`
                : value.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            bgcolor: "#f5f5f5",
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Container maxWidth="lg" sx={{ width: "100%" }}>
            <Typography
              variant="h4"
              sx={{
                mb: { xs: 3, sm: 4 },
                fontWeight: 600,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid
              container
              spacing={{ xs: 2, sm: 3 }}
              sx={{
                mb: { xs: 3, sm: 4 },
                maxWidth: "100%",
              }}
            >
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  icon={<Package size={28} />}
                  label="Total Products"
                  value={stats.totalProducts}
                  color="#E53935"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  icon={<Users size={28} />}
                  label="Total Users"
                  value={stats.totalUsers}
                  color="#1976D2"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  icon={<ShoppingCart size={28} />}
                  label="Total Orders"
                  value={stats.totalOrders}
                  color="#388E3C"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  icon={<TrendingUp size={28} />}
                  label="Total Revenue"
                  value={stats.totalRevenue}
                  color="#F57C00"
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} lg={6}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Monthly Sales
                    </Typography>
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      minHeight={250}
                    >
                      <LineChart
                        data={salesData}
                        margin={{
                          top: 5,
                          right: 10,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          style={{ fontSize: "0.875rem" }}
                        />
                        <YAxis style={{ fontSize: "0.875rem" }} />
                        <Tooltip
                          contentStyle={{
                            fontSize: "0.875rem",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#E53935"
                          strokeWidth={2}
                          name="Sales (VND)"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Orders Per Month
                    </Typography>
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      minHeight={250}
                    >
                      <BarChart
                        data={salesData}
                        margin={{
                          top: 5,
                          right: 10,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          style={{ fontSize: "0.875rem" }}
                        />
                        <YAxis style={{ fontSize: "0.875rem" }} />
                        <Tooltip
                          contentStyle={{
                            fontSize: "0.875rem",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                        <Bar
                          dataKey="orders"
                          fill="#1976D2"
                          name="Orders"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <Footer />
    </div>
  );
};

export default Dashboard;
