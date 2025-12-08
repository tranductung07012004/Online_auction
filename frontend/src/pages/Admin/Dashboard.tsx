import React, { useState, useEffect } from "react";
import { Box, Container, Card, CardContent, Typography } from "@mui/material";
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
  AreaChart,
  Area,
} from "recharts";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Gavel,
  UserPlus,
  UserCheck,
} from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  newAuctions: number;
  newUsers: number;
  newSellerUpgrades: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API calls later
    const mockStats: DashboardStats = {
      totalProducts: 156,
      totalUsers: 2450,
      totalOrders: 5230,
      totalRevenue: 125000000,
    };

    // Mock data based on system requirements:
    // - New auction platforms
    // - Revenue
    // - New users
    // - Bidder upgraded to seller
    const mockMonthlyData: MonthlyData[] = [
      {
        month: "January",
        revenue: 45000000,
        newAuctions: 45,
        newUsers: 320,
        newSellerUpgrades: 12,
      },
      {
        month: "February",
        revenue: 38000000,
        newAuctions: 38,
        newUsers: 280,
        newSellerUpgrades: 10,
      },
      {
        month: "March",
        revenue: 52000000,
        newAuctions: 52,
        newUsers: 410,
        newSellerUpgrades: 15,
      },
      {
        month: "April",
        revenue: 48000000,
        newAuctions: 48,
        newUsers: 360,
        newSellerUpgrades: 13,
      },
      {
        month: "May",
        revenue: 55000000,
        newAuctions: 55,
        newUsers: 450,
        newSellerUpgrades: 18,
      },
      {
        month: "June",
        revenue: 62000000,
        newAuctions: 62,
        newUsers: 520,
        newSellerUpgrades: 20,
      },
    ];

    setStats(mockStats);
    setMonthlyData(mockMonthlyData);
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
            bgcolor: "#fdfcf9",
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 3, // khoảng cách giữa các card
                mb: { xs: 3, sm: 4 },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <StatCard
                  icon={<Package size={28} />}
                  label="Total Products"
                  value={stats.totalProducts}
                  color="#C3937C"
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <StatCard
                  icon={<Users size={28} />}
                  label="Total Users"
                  value={stats.totalUsers}
                  color="#1976D2"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <StatCard
                  icon={<ShoppingCart size={28} />}
                  label="Total Orders"
                  value={stats.totalOrders}
                  color="#388E3C"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <StatCard
                  icon={<TrendingUp size={28} />}
                  label="Total Revenue"
                  value={stats.totalRevenue}
                  color="#F57C00"
                />
              </Box>
            </Box>

            {/* Charts */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, sm: 3 },
                mb: { xs: 3, sm: 4 },
              }}
            >
              {/* Revenue Chart */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", lg: "1 1 calc(50% - 12px)" },
                  minWidth: { xs: "100%", lg: "calc(50% - 12px)" },
                }}
              >
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <TrendingUp size={24} color="#F57C00" />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        Monthly Revenue
                      </Typography>
                    </Box>
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      minHeight={250}
                    >
                      <AreaChart
                        data={monthlyData}
                        margin={{
                          top: 5,
                          right: 10,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#F57C00"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#F57C00"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          style={{ fontSize: "0.875rem" }}
                        />
                        <YAxis
                          style={{ fontSize: "0.875rem" }}
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(0)}M`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            fontSize: "0.875rem",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [
                            `${(value / 1000000).toFixed(1)}M VND`,
                            "Revenue",
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#F57C00"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          name="Revenue (VND)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              {/* New Auctions Chart */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", lg: "1 1 calc(50% - 12px)" },
                  minWidth: { xs: "100%", lg: "calc(50% - 12px)" },
                }}
              >
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Gavel size={24} color="#C3937C" />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        New Auction Platforms
                      </Typography>
                    </Box>
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      minHeight={250}
                    >
                      <BarChart
                        data={monthlyData}
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
                          formatter={(value: number) => [
                            `${value} platforms`,
                            "New auction platforms",
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                        <Bar
                          dataKey="newAuctions"
                          fill="#C3937C"
                          name="New Auction Platforms"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              {/* New Users Chart */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", lg: "1 1 calc(50% - 12px)" },
                  minWidth: { xs: "100%", lg: "calc(50% - 12px)" },
                }}
              >
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <UserPlus size={24} color="#1976D2" />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        New Users
                      </Typography>
                    </Box>
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      minHeight={250}
                    >
                      <LineChart
                        data={monthlyData}
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
                          formatter={(value: number) => [
                            `${value} users`,
                            "New users",
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                        <Line
                          type="monotone"
                          dataKey="newUsers"
                          stroke="#1976D2"
                          strokeWidth={2}
                          name="New Users"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              {/* New Seller Upgrades Chart */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", lg: "1 1 calc(50% - 12px)" },
                  minWidth: { xs: "100%", lg: "calc(50% - 12px)" },
                }}
              >
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <UserCheck size={24} color="#388E3C" />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        New Seller Upgrades from Bidders
                      </Typography>
                    </Box>
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      minHeight={250}
                    >
                      <BarChart
                        data={monthlyData}
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
                          formatter={(value: number) => [
                            `${value} users`,
                            "Seller upgrades",
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                        <Bar
                          dataKey="newSellerUpgrades"
                          fill="#388E3C"
                          name="New Seller Upgrades"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </div>
  );
};

export default Dashboard;
