import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { lazy, Suspense, useEffect } from "react";
import { LoadingOverlay } from "../components/ui/LoadingOverlay";
import UserLayout from "../components/layouts/UserLayout";
import { toast } from "react-hot-toast";
import { isOnlyRole, hasRolePermission, UserRole } from "../libs/utils";

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
const UserReview = lazy(() => import("../pages/Profile/UserReview"));
const PublicUserReview = lazy(() => import("../pages/Public/PublicUserReview"));
const CreateProduct = lazy(() => import("../pages/Seller/CreateProduct"));

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

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Only allow specific role (exact match)
   * Use this for "only X" scenarios (e.g., only bidder, only seller)
   */
  onlyRole?: "BIDDER" | "SELLER" | "ADMIN";
  /**
   * Minimum required role (hierarchical)
   * Guest can access GUEST, BIDDER can access GUEST+BIDDER, SELLER can access GUEST+BIDDER+SELLER
   * Admin is separate and can only access ADMIN
   */
  requiredRole?: "GUEST" | "BIDDER" | "SELLER" | "ADMIN";
  /**
   * Redirect path when user doesn't have permission
   */
  redirectTo?: string;
}

// Protected Route component - requires authentication and role check
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onlyRole,
  requiredRole,
  redirectTo = "/notfound",
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const role: UserRole = useAuthStore((state) => state.role);

  if (isLoading) {
    return <LoadingOverlay message="Verifying your account..." fullScreen />;
  }

  // Check "only" permission (exact match)
  if (onlyRole) {
    if (!isAuthenticated) {
      return <Navigate to="/signin" replace={true} />;
    }
    if (!isOnlyRole(role, onlyRole)) {
      return <Navigate to={redirectTo} replace={true} />;
    }
    return <>{children}</>;
  }

  // Check hierarchical permission
  if (requiredRole) {
    // For GUEST, no authentication needed
    if (requiredRole === "GUEST") {
      return <>{children}</>;
    }

    // For other roles, authentication is required
    if (!isAuthenticated) {
      return <Navigate to="/signin" replace={true} />;
    }

    if (!hasRolePermission(role, requiredRole)) {
      return <Navigate to={redirectTo} replace={true} />;
    }
    return <>{children}</>;
  }

  // If no permission specified but route is protected, require authentication
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace={true} />;
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

  // useEffect(() => {
  //   if (isAuthenticated && !isLoading) {
  //     toast("You have already logged in, please logout", {
  //       duration: 2000,
  //     });
  //   }
  // }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingOverlay message="Verifying your account..." fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace={true} />;
  }

  return <>{children}</>;
};

// Public Route component - allows guest, bidder, seller but excludes admin
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/admin/dashboard",
}) => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const role: UserRole = useAuthStore((state) => state.role);

  if (isLoading) {
    return <LoadingOverlay message="Verifying your account..." fullScreen />;
  }

  // Redirect admin away from public pages
  if (role === "ADMIN") {
    return <Navigate to={redirectTo} replace={true} />;
  }

  // Allow guest, bidder, seller
  return <>{children}</>;
};

const AppRoutes = () => {
  const routes = [
    // Public routes - anyone can access
    { path: "/", element: <HomeNew /> },
    // { path: "/product-page", element: <PDP /> },
    { path: "/product-page/:id", element: <PDP /> },
    { path: "/pcp", element: <PCP /> },
    { path: "/search", element: <SearchOverlay /> },
    {
      path: "/reviews/user/:userId",
      element: (
        <PublicRoute>
          <PublicUserReview />
        </PublicRoute>
      ),
    },

    // Guest only routes - redirect if authenticated
    {
      path: "/signin",
      element: (
        <GuestRoute>
          <SignIn />
        </GuestRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <GuestRoute>
          <SignUp />
        </GuestRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <GuestRoute>
          <ForgotPassword />
        </GuestRoute>
      ),
    },

    // Only BIDDER routes
    {
      path: "/become-seller",
      element: (
        <ProtectedRoute onlyRole="BIDDER">
          <SellerRequest />
        </ProtectedRoute>
      ),
    },

    // Only SELLER routes
    {
      path: "/my-products",
      element: (
        <ProtectedRoute onlyRole="SELLER">
          <MyProducts />
        </ProtectedRoute>
      ),
    },
    {
      path: "/create-product",
      element: (
        <ProtectedRoute onlyRole="SELLER">
          <CreateProduct />
        </ProtectedRoute>
      ),
    },

    // Admin routes - only ADMIN
    {
      path: "/admin/dashboard",
      element: (
        <ProtectedRoute onlyRole="ADMIN">
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/products",
      element: (
        <ProtectedRoute onlyRole="ADMIN">
          <Products />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/categories",
      element: (
        <ProtectedRoute onlyRole="ADMIN">
          <Categories />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <ProtectedRoute onlyRole="ADMIN">
          <Users />
        </ProtectedRoute>
      ),
    },

    // Other routes (not specified in requirements, keeping as is for now)
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    { path: "/order-history", element: <OrderHistory /> },
    { path: "/order/:id", element: <OrderProcess /> },
    { path: "/watchlist", element: <WatchList /> },
    { path: "/my-bids", element: <MyBids /> },
    { path: "/user-review", element: <UserReview /> },
    { path: "/verify-email", element: <VerifyEmail /> },
    { path: "/reset-password", element: <ResetPassword /> },

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
