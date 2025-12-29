import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Package,
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import * as adminDashboardApi from "../../api/adminDashboard";
import type {
  AdminDashboardUserStats,
  AdminDashboardStats,
  RecentUserDTO,
  RecentProductDTO,
} from "../../api/adminDashboard";

const Dashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<AdminDashboardUserStats | null>(
    null
  );
  const [productStats, setProductStats] = useState<AdminDashboardStats | null>(
    null
  );
  const [recentUsers, setRecentUsers] = useState<RecentUserDTO[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          userStatsRes,
          productStatsRes,
          recentUsersRes,
          recentProductsRes,
        ] = await Promise.all([
          adminDashboardApi.getUserStatistics(),
          adminDashboardApi.getDashboardStats(),
          adminDashboardApi.getRecentUsers(5),
          adminDashboardApi.getRecentProducts(5),
        ]);

        setUserStats(userStatsRes.data.data);
        setProductStats(productStatsRes.data.data);
        setRecentUsers(recentUsersRes.data.data);
        setRecentProducts(recentProductsRes.data.data);
      } catch (e: unknown) {
        console.error("Failed to fetch dashboard data", e);
        const err = e as { response?: { data?: { message?: string } } };
        setError(
          err?.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Pie chart colors
  const COLORS = ["#C3937C", "#1976D2", "#388E3C", "#F57C00", "#9C27B0"];

  // Prepare data for user role pie chart
  const userRoleData = userStats
    ? [
        { name: "Admins", value: userStats.adminCount },
        { name: "Sellers", value: userStats.sellerCount },
        { name: "Bidders", value: userStats.bidderCount },
      ]
    : [];

  // Prepare data for auction status pie chart
  const auctionStatusData = productStats
    ? [
        { name: "Active", value: productStats.activeAuctions },
        { name: "Ended", value: productStats.endedAuctions },
        { name: "Ending Soon", value: productStats.endingSoonAuctions },
      ]
    : [];

  // Prepare data for seller requests bar chart
  const sellerRequestsData = userStats
    ? [
        { name: "Pending", value: userStats.pendingSellerRequests },
        { name: "Approved", value: userStats.approvedSellerRequests },
        { name: "Rejected", value: userStats.rejectedSellerRequests },
      ]
    : [];

  // Prepare data for top categories
  const topCategoriesData = productStats?.topCategories || [];

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
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleColor = (
    role: string
  ): "error" | "primary" | "success" | "default" => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "error";
      case "SELLER":
        return "primary";
      case "BIDDER":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#fdfcf9",
          }}
        >
          <CircularProgress sx={{ color: "#C3937C" }} />
        </Box>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#fdfcf9",
            p: 4,
          }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          bgcolor: "#fdfcf9",
          p: { xs: 2, sm: 3, md: 4 },
          flexGrow: 1,
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
              gap: 3,
              mb: { xs: 3, sm: 4 },
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <StatCard
                icon={<Package size={28} />}
                label="Total Products"
                value={productStats?.totalProducts || 0}
                color="#C3937C"
              />
            </Box>

            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <StatCard
                icon={<Users size={28} />}
                label="Total Users"
                value={userStats?.totalUsers || 0}
                color="#1976D2"
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <StatCard
                icon={<Gavel size={28} />}
                label="Active Auctions"
                value={productStats?.activeAuctions || 0}
                color="#388E3C"
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <StatCard
                icon={<Clock size={28} />}
                label="Pending Requests"
                value={userStats?.pendingSellerRequests || 0}
                color="#F57C00"
              />
            </Box>
          </Box>

          {/* Charts Row 1 */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 },
            }}
          >
            {/* User Roles Pie Chart */}
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
                    <Users size={24} color="#1976D2" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Users by Role
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Auction Status Pie Chart */}
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
                    <Gavel size={24} color="#388E3C" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Auction Status
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={auctionStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {auctionStatusData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Seller Requests Bar Chart */}
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
                    <AlertCircle size={24} color="#F57C00" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Seller Upgrade Requests
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sellerRequestsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Requests"
                        radius={[8, 8, 0, 0]}
                      >
                        <Cell fill="#F57C00" />
                        <Cell fill="#388E3C" />
                        <Cell fill="#D32F2F" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Top Categories Bar Chart */}
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
                    <Package size={24} color="#C3937C" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Top Categories
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCategoriesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="categoryName"
                        type="category"
                        width={100}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="productCount"
                        name="Products"
                        fill="#C3937C"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Recent Data Tables */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 },
            }}
          >
            {/* Recent Users Table */}
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
                    <Users size={24} color="#1976D2" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Recent Users
                    </Typography>
                  </Box>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Avatar
                                  src={user.avatar}
                                  sx={{ width: 32, height: 32 }}
                                >
                                  {user.fullname?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {user.fullname}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"
                                color={getRoleColor(user.role)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(user.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {user.verified ? (
                                <CheckCircle size={18} color="#388E3C" />
                              ) : (
                                <XCircle size={18} color="#D32F2F" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {recentUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No recent users
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Recent Products Table */}
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
                    <Package size={24} color="#C3937C" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      Recent Products
                    </Typography>
                  </Box>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Bids</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Avatar
                                  src={product.thumbnailUrl}
                                  variant="rounded"
                                  sx={{ width: 40, height: 40 }}
                                >
                                  <Package size={20} />
                                </Avatar>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  sx={{
                                    maxWidth: 120,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {product.productName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {product.bidCount} bids
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {product.currentPrice?.toLocaleString()} VND
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={product.isActive ? "ACTIVE" : "ENDED"}
                                size="small"
                                color={product.isActive ? "success" : "default"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {recentProducts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No recent products
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Additional Stats Cards */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 3,
              mb: { xs: 3, sm: 4 },
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
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
                      mb: 1,
                    }}
                  >
                    <CheckCircle size={20} color="#388E3C" />
                    <Typography variant="body2" color="textSecondary">
                      Verified Users
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    {userStats?.verifiedUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
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
                      mb: 1,
                    }}
                  >
                    <XCircle size={20} color="#D32F2F" />
                    <Typography variant="body2" color="textSecondary">
                      Unverified Users
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    {userStats?.unverifiedUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
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
                      mb: 1,
                    }}
                  >
                    <Gavel size={20} color="#F57C00" />
                    <Typography variant="body2" color="textSecondary">
                      Ending Soon
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    {productStats?.endingSoonAuctions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: "1 1 45%", md: 1 } }}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
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
                      mb: 1,
                    }}
                  >
                    <Package size={20} color="#9C27B0" />
                    <Typography variant="body2" color="textSecondary">
                      Total Categories
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    {productStats?.totalCategories || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default Dashboard;
