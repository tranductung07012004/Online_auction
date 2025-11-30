import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Notification } from '../../components/ui/Notification';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });
  
  const { getRoleFromCookie, setAuthLoading, isAuthLoading } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setShowForgotPassword(false);
    setLoading(true);
    setAuthLoading(true);

    try {
      const response = await login(formData);
      
      // Kiểm tra xem tài khoản đã được xác thực email chưa
      if (response.isVerified === false) {
        setError('Your account is not verified. Please check your email and verify your account.');
        
        // Chuyển hướng đến trang xác thực email với email của người dùng
        navigate('/verify-email', { 
          state: { email: response.email } // Use the email returned from the API response
        });
        return;
      }
      
      // Get user role and set auth state
      const role = await getRoleFromCookie();
      console.log('User role:', role);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: role === 'admin' ? 'Admin login successful! Redirecting to dashboard...' : 'Login successful! Redirecting...',
        visible: true
      });
      
      // Redirect based on role - Admin goes to dashboard, users go to profile
      if (role === 'admin') {
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 500);
      } else if (role === 'user') {
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 500);
      }
    } catch (err: any) {
      // Handle specific error codes
      const errorResponse = err.response?.data;
      
      if (errorResponse?.errorCode === 'USER_NOT_FOUND') {
        setError('Account not found. Please register to create an account.');
        // Add a button/link to registration page
      } else if (errorResponse?.errorCode === 'INVALID_PASSWORD') {
        setError('Incorrect password. Did you forget your password?');
        setShowForgotPassword(true);
      } else {
        setError(errorResponse?.message || err.message || 'Login failed');
      }
      
      setNotification({
        type: 'error',
        message: 'Login failed',
        visible: true
      });
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const goToForgotPassword = () => {
    navigate('/forgot-password');
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row relative">
      {/* Left side - Image */}
      <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
        <img
          src="https://jejuwedding.vn/wp-content/uploads/2024/12/PLUS1307-1-scaled-e1735352863254.jpg"
          className="w-full h-full object-cover"
          alt="Login image"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 relative">
        {isAuthLoading && (
          <LoadingOverlay message="Authenticating..." />
        )}
        
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          <h1 className="text-3xl font-medium text-[#c3937c] text-center">
            Login
          </h1>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
              {showForgotPassword && (
                <div className="mt-2">
                  <button 
                    onClick={goToForgotPassword}
                    className="text-rose-700 underline hover:text-rose-800"
                  >
                    Reset your password
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-[#999999]" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-3 border border-[#dfdfdf] rounded-full focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-[#999999]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 border border-[#dfdfdf] rounded-full focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-[#999999]" />
                ) : (
                  <Eye className="h-5 w-5 text-[#999999]" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-[#c3937c] hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ead9c9] text-[#c3937c] rounded-full font-medium hover:bg-[#c3937c] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="mr-2">Logging in</span>
                  <span className="animate-pulse">...</span>
                </>
              ) : 'Login'}
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center">
              <div className="border-t border-[#dfdfdf] w-full"></div>
              <span className="px-4 text-[#999999]">Or</span>
              <div className="border-t border-[#dfdfdf] w-full"></div>
            </div>

            {/* Social Login Buttons */}
            <button
              type="button"
              className="w-full py-3 border border-[#dfdfdf] rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[#404040]">Login with Google</span>
            </button>

            <button
              type="button"
              className="w-full py-3 border border-[#dfdfdf] rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              <span className="text-[#404040]">Login with facebook</span>
            </button>

            <button
              type="button"
              className="w-full py-3 border border-[#dfdfdf] rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
              </svg>
              <span className="text-[#404040]">Login with Apple ID</span>
            </button>
          </form>

          {/* Terms and Sign Up */}
          <div className="text-center space-y-4">
            <p className="text-xs text-[#999999]">
              Signing up means you agree to the{' '}
              <a href="#" className="text-[#404040]">
                Privacy policy
              </a>
              ,{' '}
              <a href="#" className="text-[#404040]">
                Terms of Services
              </a>{' '}
              and{' '}
              <a href="#" className="text-[#404040]">
                Affiliate Terms
              </a>
              .
            </p>

            <p className="text-sm text-[#404040]">
              New to ENCOUNTERED WEDDING?{' '}
              <Link to="/signup" className="text-[#c3937c] font-medium">
                Sign Up
              </Link>
            </p>
            <p className="text-10 text-[#404040]">
              Just don't want to log in?{' '}
              <Link to="/" className="text-[#c3937c] font-medium">
                Be our guest!
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={handleCloseNotification}
      />
    </div>
  );
};

export default SignIn;
