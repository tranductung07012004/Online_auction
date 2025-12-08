import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { lazy, Suspense } from "react";
import { LoadingOverlay } from "../components/ui/LoadingOverlay";
import UserLayout from "../components/layouts/UserLayout";

// Lazy load pages
const HomeNew = lazy(() => import("../pages/Home/Home"));
const NotFoundPage = lazy(() => import("../pages/404/404"));
const PDP = lazy(() => import("../pages/PDP/PDP"));
const PCP = lazy(() => import("../pages/PCP/PCP"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const OrderHistory = lazy(() => import("../pages/Profile/OrderHistory"));
const Address = lazy(() => import("../pages/Profile/Address"));
const OrderDetails = lazy(() => import("../pages/Profile/OrderDetails"));
const SellerRequest = lazy(() => import("../pages/Profile/SellerRequest"));
const WatchList = lazy(() => import("../pages/Profile/WatchList"));
const MyBids = lazy(() => import("../pages/Profile/MyBids"));
const MyProducts = lazy(() => import("../pages/Profile/MyProducts"));
const CreateProduct = lazy(() => import("../pages/Seller/CreateProduct"));
const Checkout = lazy(() => import("../pages/Payment/Checkout"));
const Information = lazy(() => import("../pages/Payment/Information"));
const Successful = lazy(() => import("../pages/Payment/Successful"));
const PaymentReview = lazy(() => import("../pages/Payment/PaymentReview"));
const SearchOverlay = lazy(() => import("../pages/Search/SearchOverlay"));
const Appointment = lazy(() => import("../pages/Appointment/Appointment"));
const Photography = lazy(() => import("../pages/Photography/Photography"));
const PhotographyServiceDetail = lazy(
  () => import("../pages/Photography/ServiceDetail")
);

// Admin Components
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Products = lazy(() => import("../pages/Admin/Products"));
const Categories = lazy(() => import("../pages/Admin/Categories"));
const Users = lazy(() => import("../pages/Admin/Users"));

const SignIn = lazy(() => import("../pages/Auth/SignIn"));
const SignUp = lazy(() => import("../pages/Auth/SignUp"));
const VerifyEmail = lazy(() => import("../pages/Auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const AboutPage = lazy(() => import("../pages/About/About"));

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

// Protected Route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Verifying your account..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace={true} />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/notfound" replace={true} />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const routes = [
    { path: "/", element: <HomeNew /> },
    { path: "/pdp", element: <PDP /> },
    { path: "/pdp/:id", element: <PDP /> },
    // { path: '/product/:id', element: <PDP /> },
    { path: "/pcp", element: <PCP /> },
    { path: "/appointment", element: <Appointment /> },
    { path: "/photography", element: <Photography /> },
    {
      path: "/photography/service-detail/:id",
      element: <PhotographyServiceDetail />,
    },
    {
      path: "/profile",
      //(
      element: (
        // <ProtectedRoute requiredRole="user">
        <ProfilePage />
      ),
      // </ProtectedRoute>
      // ),
    },
    { path: "/order-history", element: <OrderHistory /> },
    { path: "/address", element: <Address /> },
    { path: "/order-details/:id", element: <OrderDetails /> },
    { path: "/become-seller", element: <SellerRequest /> },
    { path: "/watchlist", element: <WatchList /> },
    { path: "/my-bids", element: <MyBids /> },
    { path: "/my-products", element: <MyProducts /> },
    { path: "/create-product", element: <CreateProduct /> },
    { path: "/payment-checkout", element: <Checkout /> },
    { path: "/payment-information", element: <Information /> },
    { path: "/payment-successful", element: <Successful /> },
    { path: "/payment-review", element: <PaymentReview /> },
    { path: "/order-success", element: <Successful /> },

    // Admin Routes
    { path: "/admin/dashboard", element: <Dashboard /> },
    { path: "/admin/products", element: <Products /> },
    { path: "/admin/categories", element: <Categories /> },
    { path: "/admin/users", element: <Users /> },

    // Auth Routes
    { path: "/signin", element: <SignIn /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/verify-email", element: <VerifyEmail /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },

    // Other Routes
    { path: "/cart", element: <Cart /> },
    { path: "/about", element: <AboutPage /> },
    { path: "/search", element: <SearchOverlay /> },

    // Fallback Route
    { path: "*", element: <NotFoundPage /> },
  ];

  return (
    <Suspense
      fallback={<LoadingOverlay message="Loading page..." fullScreen />}
    >
      <UserLayout>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </UserLayout>
    </Suspense>
  );
};

export default AppRoutes;
