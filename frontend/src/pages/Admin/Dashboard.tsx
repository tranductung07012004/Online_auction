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
import AdminSidebar from "./AdminSidebar";

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
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: `${color}20`,
              color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography color="textSecondary" variant="body2">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {typeof value === "number" && label.includes("Revenue")
                ? `${(value / 1000000).toFixed(1)}M`
                : value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1 }}>
        <AdminSidebar />

        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<Package size={28} />}
                  label="Total Products"
                  value={stats.totalProducts}
                  color="#E53935"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<Users size={28} />}
                  label="Total Users"
                  value={stats.totalUsers}
                  color="#1976D2"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<ShoppingCart size={28} />}
                  label="Total Orders"
                  value={stats.totalOrders}
                  color="#388E3C"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<TrendingUp size={28} />}
                  label="Total Revenue"
                  value={stats.totalRevenue}
                  color="#F57C00"
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Monthly Sales
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#E53935"
                          name="Sales (VND)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Orders Per Month
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orders" fill="#1976D2" name="Orders" />
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
    </Box>
  );
};

export default Dashboard;
