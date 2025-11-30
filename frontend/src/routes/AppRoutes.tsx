import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lazy, Suspense } from 'react';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import UserLayout from '../components/layouts/UserLayout';

// Lazy load pages
const Home = lazy(() => import('../pages/Home/Home'));
const HomeNew = lazy(() => import('../pages/Home/HomeNew'));
const NotFoundPage = lazy(() => import('../pages/404/404'));
const PDP = lazy(() => import('../pages/PDP/PDP'));
const PCP = lazy(() => import('../pages/PCP/PCP'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const OrderHistory = lazy(() => import('../pages/Profile/OrderHistory'));
const CurrentOrders = lazy(() => import('../pages/Profile/CurrentOrders'));
const Address = lazy(() => import('../pages/Profile/Address'));
const Settings = lazy(() => import('../pages/Profile/Settings'));
const OrderDetails = lazy(() => import('../pages/Profile/OrderDetails'));
const Review = lazy(() => import('../pages/Payment/Review'));
const Information = lazy(() => import('../pages/Payment/Information'));
const Shipping = lazy(() => import('../pages/Payment/Shipping'));
const Checkout = lazy(() => import('../pages/Payment/Checkout'));
const Successful = lazy(() => import('../pages/Payment/Successful'));
const SearchOverlay = lazy(() => import('../pages/Search/SearchOverlay'));
const Appointment = lazy(() => import('../pages/Appointment/Appointment'));
const Photography = lazy(() => import('../pages/Photography/Photography'));
const PhotographyServiceDetail = lazy(() => import('../pages/Photography/ServiceDetail'));

// New Admin Components
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/Admin/Products'));
const AdminCustomers = lazy(() => import('../pages/Admin/Customers'));
const AdminOrders = lazy(() => import('../pages/Admin/Orders'));
const AdminAppointments = lazy(() => import('../pages/Admin/Appointments'));
const AdminContacts = lazy(() => import('../pages/Admin/Contacts'));
const AdminCustomerFitting = lazy(() => import('../pages/Admin/CustomerFitting'));
const AdminPhotography = lazy(() => import('../pages/Admin/Photography'));
const AdminPhotographyStatistics = lazy(() => import('../pages/Admin/PhotographyStatistics'));
const AdminSettings = lazy(() => import('../pages/Admin/Settings'));
const AdminChat = lazy(() => import('../pages/Admin/Chat'));

const SignIn = lazy(() => import('../pages/Auth/SignIn'));
const SignUp = lazy(() => import('../pages/Auth/SignUp'));
const VerifyEmail = lazy(() => import('../pages/Auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const Cart = lazy(() => import('../pages/Cart/Cart'));
const AboutPage = lazy(() => import('../pages/About/About'));

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
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
    { path: '/', element: <Home /> },
    { path: '/home-new', element: <HomeNew /> },
    { path: '/pdp', element: <PDP /> },
    { path: '/pdp/:id', element: <PDP /> },
    { path: '/product/:id', element: <PDP /> },
    { path: '/pcp', element: <PCP /> },
    { path: '/appointment', element: <Appointment /> },
    { path: '/photography', element: <Photography /> },
    { path: '/photography/service-detail/:id', element: <PhotographyServiceDetail /> },
    {
      path: '/profile',
      element: (
        <ProtectedRoute requiredRole="user">
          <ProfilePage />
        </ProtectedRoute>
      ),
    },
    { path: '/order-history', element: <OrderHistory /> },
    { path: '/current-orders', element: <CurrentOrders /> },
    { path: '/address', element: <Address /> },
    { 
      path: '/settings', 
      element: (
        <ProtectedRoute requiredRole="user">
          <Settings />
        </ProtectedRoute>
      ) 
    },
    { path: '/order-details/:id', element: <OrderDetails /> },
    { path: '/payment-review', element: <Review /> },
    { path: '/payment-information', element: <Information /> },
    { path: '/payment-shipping', element: <Shipping /> },
    { path: '/payment-checkout', element: <Checkout /> },
    { path: '/payment-successful', element: <Successful /> },
    { path: '/order-success', element: <Successful /> },
    
    // Admin Routes
    {
      path: '/admin/dashboard',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/products',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminProducts />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/customers',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminCustomers />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/orders',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminOrders />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/appointments',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminAppointments />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/contacts',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminContacts />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/customer-fitting',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminCustomerFitting />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/photography',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminPhotography />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/settings',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminSettings />
        </ProtectedRoute>
      ),
    },
    
    // Photography Statistics page
    {
      path: '/admin/photography-statistics',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminPhotographyStatistics />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/chat',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminChat />
        </ProtectedRoute>
      ),
    },
    
    // Redirect old admin routes to new admin dashboard
    {
      path: '/admin/measurement',
      element: (
        <ProtectedRoute requiredRole="admin">
          <Navigate to="/admin/customer-fitting" replace />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/styles',
      element: (
        <ProtectedRoute requiredRole="admin">
          <Navigate to="/admin/customer-fitting" replace />
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/*',
      element: (
        <ProtectedRoute requiredRole="admin">
          <Navigate to="/admin/dashboard" replace />
        </ProtectedRoute>
      ),
    },
    
    // Auth Routes
    { path: '/signin', element: <SignIn /> },
    { path: '/signup', element: <SignUp /> },
    { path: '/verify-email', element: <VerifyEmail /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/reset-password', element: <ResetPassword /> },
    
    // Other Routes
    { path: '/cart', element: <Cart /> },
    { path: '/about', element: <AboutPage /> },
    { path: '/search', element: <SearchOverlay /> },
    
    // Fallback Route
    { path: '*', element: <NotFoundPage /> },
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
