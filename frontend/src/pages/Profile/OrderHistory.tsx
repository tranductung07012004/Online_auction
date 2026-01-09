import { JSX, useState, useEffect } from "react";
import Header from "../../components/header";
import ProfileSidebar from "./profile/sidebar";
import { OrderCard, type OrderItem } from "./profile/order-card";
import Footer from "../../components/footer";
import { useAuthStore } from "../../stores/authStore";
import { getUserProfile, UserProfileResponse } from "../../api/profileApi";
import { getAllOrders } from "../../api/order";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Chip, Box, CircularProgress } from "@mui/material";
import {
  ShoppingCart,
  CheckCircle,
  LocalShipping,
  Verified,
  RateReview,
  Cancel,
  Home,
  AccountBalance,
} from "@mui/icons-material";

// Order Status Configuration
const OrderStatusConfig: Record<
  string,
  { label: string; color: string; icon: JSX.Element }
> = {
  CREATED: {
    label: "Order Created",
    color: "#2196f3", // Blue
    icon: <ShoppingCart sx={{ fontSize: 16 }} />,
  },
  CONFIRMED: {
    label: "Order Confirmed",
    color: "#03a9f4", // Light Blue
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
  },
  ADDRESS_PROVIDED: {
    label: "Address Provided",
    color: "#00bcd4", // Cyan
    icon: <Home sx={{ fontSize: 16 }} />,
  },
  PAYMENT_PROOF_UPLOADED: {
    label: "Payment Proof Uploaded",
    color: "#ff9800", // Orange
    icon: <AccountBalance sx={{ fontSize: 16 }} />,
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    color: "#ffc107", // Amber
    icon: <Verified sx={{ fontSize: 16 }} />,
  },
  SHIPPED: {
    label: "In Transit",
    color: "#9c27b0", // Purple
    icon: <LocalShipping sx={{ fontSize: 16 }} />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "#4caf50", // Green
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
  },
  REVIEWED: {
    label: "Reviewed",
    color: "#8bc34a", // Light Green
    icon: <RateReview sx={{ fontSize: 16 }} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#f44336", // Red
    icon: <Cancel sx={{ fontSize: 16 }} />,
  },
};

export default function OrderHistory(): JSX.Element {
  const [showCurrentOrders] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const ordersData = await getAllOrders();

        // Fetch payment and shipping info for each order to calculate status
        const formattedOrders: OrderItem[] = await Promise.all(
          ordersData.map(async (order: any) => {
            // Get status configuration
            const orderStatus = order.status || "CREATED";
            const statusConfig = OrderStatusConfig[orderStatus] || {
              label: orderStatus,
              color: "#9e9e9e",
              icon: <ShoppingCart sx={{ fontSize: 16 }} />,
            };

            return {
              id: order.id,
              name: order.product?.productName || "Unknown Product",
              image: order.product?.thumbnailUrl || "/placeholder.jpg",
              status: order.isCancelled ? "cancelled" : "pending", // Keep for compatibility
              orderStatus: orderStatus, // Actual database status
              statusLabel: statusConfig.label,
              statusColor: statusConfig.color,
              statusIcon: statusConfig.icon,
              purchaseType: order.product?.buyNowPrice ? "buy" : "rent",
              current_price: order.amount || order.product?.currentPrice,
              buy_now_price: order.product?.buyNowPrice,
              created_at: order.createdAt,
              // Dummy fields for compatibility with OrderCard
              size: "",
              color: "",
              rentalDuration: "",
              arrivalDate: "",
              returnDate: "",
            } as OrderItem & {
              orderStatus: any;
              statusLabel: string;
              statusColor: string;
            };
          })
        );

        setOrders(formattedOrders);
      } catch (err) {
        toast.error("Không thể lấy danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, showCurrentOrders]);

  // Không filter theo trạng thái nữa, hiển thị toàn bộ đơn hàng lấy từ backend
  // const filteredOrders = orders.filter(...)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="order-history"
              userName={userData ? userData.email : "User"}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <div className="space-y-4">
              {loading ? (
                <Box className="bg-white rounded-lg border p-8 text-center">
                  <CircularProgress sx={{ color: "#8B7355" }} />
                  <p className="text-gray-500 mt-4">Loading orders...</p>
                </Box>
              ) : orders.length > 0 ? (
                orders.map((order: any) => (
                  <Link
                    to={`/order/${order.id}`}
                    key={order.id}
                    className="block hover:opacity-90 transition"
                  >
                    <Box sx={{ position: "relative" }}>
                      <OrderCard
                        key={order.id}
                        order={order}
                        onDelete={undefined}
                      />
                      {/* Status Chip Overlay with Icon */}
                      {order.statusLabel && (
                        <Chip
                          icon={order.statusIcon}
                          label={order.statusLabel}
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            bgcolor: order.statusColor || "#9e9e9e",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            zIndex: 10,
                            "& .MuiChip-icon": {
                              color: "#fff",
                              marginLeft: "8px",
                            },
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        />
                      )}
                    </Box>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <p className="text-gray-500">No orders found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
