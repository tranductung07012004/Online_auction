import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { lazy, Suspense, useEffect } from "react";
import { LoadingOverlay } from "../components/ui/LoadingOverlay";
import UserLayout from "../components/layouts/UserLayout";
import { toast } from "react-hot-toast";

// Lazy load pages
const HomeNew = lazy(() => import("../pages/Home/Home"));
const NotFoundPage = lazy(() => import("../pages/404/404"));
const PDP = lazy(() => import("../pages/PDP/PDP"));
const PCP = lazy(() => import("../pages/PCP/PCP"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const OrderHistory = lazy(() => import("../pages/Profile/OrderHistory"));
const SellerRequest = lazy(() => import("../pages/Profile/SellerRequest"));
const WatchList = lazy(() => import("../pages/Profile/WatchList"));
const MyBids = lazy(() => import("../pages/Profile/MyBids"));
const MyProducts = lazy(() => import("../pages/Profile/MyProducts"));
const CreateProduct = lazy(() => import("../pages/Seller/CreateProduct"));
const ChatPage = lazy(() => import("../pages/Profile/ChatPage"));
const ChatDetailPage = lazy(() => import("../pages/Profile/ChatDetailPage"));

// Order Flow
const OrderProcess = lazy(() => import("../pages/Order/Shared/OrderProcess"));

const SearchOverlay = lazy(() => import("../pages/Search/SearchOverlay"));

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

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "BIDDER" | "SELLER" | null;
}

// Protected Route component - requires authentication
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const role = useAuthStore((state) => state.role);

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

// Guest Route component - redirects authenticated users away from auth pages
interface GuestRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectPath = "/",
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      toast("You have already logged in, please logout", {
        duration: 2000,
      });
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingOverlay message="Verifying your account..." fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace={true} />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const routes = [
    { path: "/", element: <HomeNew /> },
    { path: "/product-page", element: <PDP /> },
    { path: "/product-page/:id", element: <PDP /> },
    { path: "/pcp", element: <PCP /> },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    { path: "/order-history", element: <OrderHistory /> },
    { path: "/order/:id", element: <OrderProcess /> },

    // Demo & Other
    { path: "/become-seller", element: <SellerRequest /> },
    { path: "/watchlist", element: <WatchList /> },
    { path: "/my-bids", element: <MyBids /> },
    { path: "/my-products", element: <MyProducts /> },
    { path: "/create-product", element: <CreateProduct /> },
    { path: "/chat", element: <ChatPage /> },
    { path: "/chat/:orderId", element: <ChatDetailPage /> },

    // Admin Routes
    { path: "/admin/dashboard", element: <Dashboard /> },
    { path: "/admin/products", element: <Products /> },
    { path: "/admin/categories", element: <Categories /> },
    { path: "/admin/users", element: <Users /> },

    // Auth Routes
    { path: "/signin", element: <SignIn /> },
    {
      path: "/signup",
      element: (
        <GuestRoute>
          <SignUp />
        </GuestRoute>
      ),
    },
    { path: "/verify-email", element: <VerifyEmail /> },
    {
      path: "/forgot-password",
      element: (
        <GuestRoute>
          <ForgotPassword />
        </GuestRoute>
      ),
    },
    { path: "/reset-password", element: <ResetPassword /> },

    // Other Routes
    { path: "/cart", element: <Cart /> },
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
