import { JSX, useState, useEffect } from "react";
import Header from "../../components/header";
import ProfileSidebar from "./profile/sidebar";
import { OrderCard, type OrderItem } from "./profile/order-card";
import Footer from "../../components/footer";
import { useAuthStore } from "../../stores/authStore";
import { getUserProfile, UserProfileResponse } from "../../api/profileApi";
import {
  getAllOrders,
  getOrderPayment,
  getOrderShipping,
} from "../../api/order";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Chip, Box, CircularProgress } from "@mui/material";

export default function OrderHistory(): JSX.Element {
  const [showCurrentOrders, setShowCurrentOrders] = useState<boolean>(false);
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
            let payment = null;
            let shipping = null;

            try {
              payment = await getOrderPayment(order.id);
            } catch (err) {
              console.log(`No payment info for order ${order.id}`);
            }

            try {
              shipping = await getOrderShipping(order.id);
            } catch (err) {
              console.log(`No shipping info for order ${order.id}`);
            }

            // Combine data for status calculation
            const combinedData = {
              ...order,
              payment: payment
                ? {
                    status: payment.paymentStatus,
                    proofUrl: payment.paymentProofUrl,
                    buyerPaidAt: payment.buyerPaidAt,
                    sellerConfirmedAt: payment.sellerConfirmedAt,
                  }
                : null,
              shipping: shipping
                ? {
                    address: shipping.shippingAddress,
                    status: shipping.deliveryStatus,
                    shippedAt: shipping.shippedAt,
                    deliveredAt: shipping.deliveredAt,
                  }
                : null,
              reviews: [], // TODO: Fetch reviews if needed
            };

            // Calculate order status
            // const orderStatus = calculateOrderStatus(combinedData);

            return {
              id: order.id,
              name: order.product?.productName || "Unknown Product",
              image: order.product?.thumbnailUrl || "/placeholder.jpg",
              status: order.isCancelled ? "cancelled" : "pending", // Keep for compatibility
              // orderStatus: orderStatus, // New field for detailed status
              // statusLabel: OrderStatusLabel[orderStatus],
              // statusColor: OrderStatusColor[orderStatus],
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
                      {/* Status Chip Overlay */}
                      {order.statusLabel && (
                        <Chip
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
