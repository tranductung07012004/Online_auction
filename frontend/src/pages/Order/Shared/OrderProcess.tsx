import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  Container,
  Button,
  Typography,
} from "@mui/material";
import { useAuthStore } from "../../../stores/authStore";
import {
  getOrderById,
  getOrderPayment,
  getOrderShipping,
} from "../../../api/order";
import {
  Order,
  OrderPayment,
  OrderShipping,
  OrderStatus,
} from "../../../types/order";

// Import flow components
import OrderReview from "./OrderReview";
import OrderDetail from "../../Profile/OrderDetail";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ArrowBack } from "@mui/icons-material";
import OrderStepper from "../../../components/OrderStepper";

// Import existing Bidder components
import ShippingAddress from "../Bidder/BidderShippingAddress";
import OrderPaymentPage from "../Bidder/BidderPayment";
import BuyerDeliveryConfirmation from "../Bidder/BidderDeliveryConfirmation";

// Import new Seller components
import SellerWaitingScreen from "../Seller/SellerWaitingScreen";
import SellerPaymentVerification from "../Seller/SellerPaymentVerification";
import SellerShipping from "../Seller/SellerShipping";
import SellerWaitingForDelivery from "../Seller/SellerWaitingForDelivery";

export default function OrderProcess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, role } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payment, setPayment] = useState<OrderPayment | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [shipping, setShipping] = useState<OrderShipping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // View Step Override: Allows user to view/edit previous steps
  const [viewStep, setViewStep] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Fetch Order, Payment, Shipping in parallel
      const [orderData, paymentData, shippingData] = await Promise.all([
        getOrderById(id),
        getOrderPayment(Number(id)).catch(() => null),
        getOrderShipping(Number(id)).catch(() => null),
      ]);

      setOrder(orderData);
      setPayment(paymentData);
      setShipping(shippingData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching order process data:", err);
      setError(err?.response?.data?.message || "Failed to load order data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const refreshData = () => {
    // When action completes, reset view to natural progress
    setViewStep(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "100vh",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error || "Order not found"}</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/order-history")}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const isBuyer = role === "BIDDER" || Number(userId) === order.buyerId;
  // const isSeller = role === "SELLER" || (Number(userId) === order.sellerId);

  // --- LOGIC TO DETERMINE PROGRESS BASED ON STATUS -----
  // Step Mapping (UPDATED - Payment before Address):
  // 0: Order Detail (CREATED / CANCELLED)
  // 1: Payment (CONFIRMED) - CHANGED: Payment first
  // 2: Shipping Address (PAYMENT_PROOF_UPLOADED / PAYMENT_CONFIRMED) - CHANGED: Address after payment
  // 3: In Transit / Wait (ADDRESS_PROVIDED)
  // 4: Delivery Confirmation (SHIPPED)
  // 5: Review (DELIVERED / REVIEWED)

  const getNaturalStep = (): number => {
    if (order.isCancelled || order.status === OrderStatus.CANCELLED) return 0;

    switch (order.status) {
      case OrderStatus.CREATED:
        return 0; // Show Order Detail (Wait for user to confirm/pay?)
      case OrderStatus.CONFIRMED:
        return 1; // Show Payment Form - CHANGED from Shipping Address
      case OrderStatus.PAYMENT_PROOF_UPLOADED:
      case OrderStatus.PAYMENT_CONFIRMED:
        return 2; // Show Shipping Address Form - CHANGED from Payment
      case OrderStatus.ADDRESS_PROVIDED:
        return 3; // Processing / In Transit (Waiting for Shipment) - CHANGED from step 3
      case OrderStatus.SHIPPED:
        return 4; // Delivery Confirmation
      case OrderStatus.DELIVERED:
      case OrderStatus.REVIEWED:
        return 5; // Done (Shows Review or Summary)
      default:
        return 0; // Fallback
    }
  };

  const naturalStep = getNaturalStep();
  const effectiveStep =
    viewStep !== null && viewStep <= naturalStep ? viewStep : naturalStep;
  // Effective step is viewStep if set, otherwise naturalStep
  // But ensure viewStep <= naturalStep (cannot jump ahead)

  // Handle Stepper Click
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= naturalStep) {
      setViewStep(stepIndex);
    }
  };

  // Render Component based on effectiveStep
  const renderStepComponent = () => {
    switch (effectiveStep) {
      case 0:
        // Status: CREATED
        // View: Order Detail
        return {
          component: <OrderDetail onProceedToNext={refreshData} />,
        };
      case 1:
        // Status: CONFIRMED
        // View: Payment - CHANGED from Shipping Address
        return {
          component: <OrderPaymentPage onSuccess={refreshData} />,
        };
      case 2:
        // Status: PAYMENT_PROOF_UPLOADED / PAYMENT_CONFIRMED
        // View: Shipping Address - CHANGED from Payment
        return {
          component: <ShippingAddress onSuccess={refreshData} />,
        };
      case 3:
        // Status: ADDRESS_PROVIDED
        // View: Waiting / In Transit - CHANGED position
        return {
          component: <BuyerDeliveryConfirmation onSuccess={refreshData} />,
        };
      case 4:
        // Status: SHIPPED
        // View: Delivery Confirmation
        return {
          component: <BuyerDeliveryConfirmation onSuccess={refreshData} />,
        };
      case 5:
        // Status: DELIVERED / REVIEWED
        // View: Review
        return { component: <OrderReview /> };
      default:
        return {
          component: <OrderDetail onProceedToNext={refreshData} />,
        };
    }
  };

  const { component: renderComponent } = renderStepComponent();

  let finalComponent = renderComponent;

  // Override for Seller View - NEW ENHANCED FLOW
  if (!isBuyer) {
    // SELLER VIEW - Follows buyer's progress with specific actions (UPDATED ORDER)
    switch (order.status) {
      case OrderStatus.CREATED:
        // Step 0: Waiting for buyer to confirm order
        finalComponent = (
          <SellerWaitingScreen
            order={order}
            message="Waiting for buyer to confirm order"
            icon="confirm"
          />
        );
        break;

      case OrderStatus.CONFIRMED:
        // Step 1: Buyer is making payment - CHANGED from shipping address
        finalComponent = (
          <SellerWaitingScreen
            order={order}
            message="Waiting for buyer to upload payment proof"
            icon="payment"
          />
        );
        break;

      case OrderStatus.PAYMENT_PROOF_UPLOADED:
        // Step 2: SELLER ACTION REQUIRED - Verify payment proof - CHANGED position
        finalComponent = (
          <SellerPaymentVerification
            order={order}
            payment={payment}
            shipping={shipping}
            onSuccess={refreshData}
          />
        );
        break;

      case OrderStatus.PAYMENT_CONFIRMED:
        // Step 3: Buyer is providing shipping address - CHANGED from shipping
        finalComponent = (
          <SellerWaitingScreen
            order={order}
            message="Waiting for buyer to provide shipping address"
            icon="address"
          />
        );
        break;

      case OrderStatus.ADDRESS_PROVIDED:
        // Step 4: SELLER ACTION REQUIRED - Ship item - CHANGED position
        finalComponent = (
          <SellerShipping
            order={order}
            shipping={shipping}
            onSuccess={refreshData}
          />
        );
        break;

      case OrderStatus.SHIPPED:
        // Step 5: Waiting for buyer to confirm delivery
        finalComponent = (
          <SellerWaitingForDelivery order={order} shipping={shipping} />
        );
        break;

      case OrderStatus.DELIVERED:
      case OrderStatus.REVIEWED:
        // Step 6: Review
        finalComponent = <OrderReview />;
        break;

      default:
        // Fallback to OrderDetail
        finalComponent = <OrderDetail onProceedToNext={refreshData} />;
    }
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: "70vh" }}>
        {/* Common Top Section */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/order-history")}
            sx={{
              color: "#8B7355",
              mb: 2,
              "&:hover": { backgroundColor: "rgba(139, 115, 85, 0.04)" },
            }}
          >
            Back to Orders
          </Button>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#2C1810",
              mb: 1,
            }}
          >
            ORDER PAYMENT
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Order ID: #{order.id}
          </Typography>
        </Box>

        {/* Stepper - Render if part of flow */}
        {/* Stepper always shows natural step (actual order status), not the view step */}
        <OrderStepper activeStep={naturalStep} onStepClick={handleStepClick} />

        {/* Child Content */}
        <Box sx={{ mt: 4 }}>{finalComponent}</Box>
      </Container>
      <Footer />
    </>
  );
}
