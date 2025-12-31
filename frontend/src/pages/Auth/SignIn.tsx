import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { login } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Notification } from '../../components/ui/Notification';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });
  const [recaptchaVerified, setRecaptchaVerified] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const { setAccessToken } = useAuthStore();

  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_V2_CHECKBOX;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    mode: 'onBlur',
  });

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaVerified(!!value);
    setRecaptchaToken(value);
  };

  const onSubmit = async (data: SignInFormData) => {
    if (!recaptchaVerified || !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      setNotification({
        type: 'error',
        message: 'Please complete the reCAPTCHA verification',
        visible: true
      });
      return;
    }

    setError('');
    setShowForgotPassword(false);
    setLoading(true);
    setAuthLoading(true);

    try {
      const response = await login({ ...data, recaptchaToken });

      if (response.data?.errorCode) {
        setError(response.message);
        setNotification({
          type: 'error',
          message: response.message,
          visible: true
        });
        return;
      }

      // Luu accessToken vao zustand store (refresh token da nam trong cookie roi)
      if (response.data) {
        setAccessToken(response.data);

        const userRole = useAuthStore.getState().role;
        console.log('User role:', userRole);

        setNotification({
          type: 'success',
          message: userRole === 'ADMIN' ? 'Admin login successful! Redirecting to dashboard...' : 'Login successful! Redirecting...',
          visible: true
        });

        if (userRole === 'ADMIN') {
          setTimeout(() => {
            navigate('/admin/dashboard', { replace: true });
          }, 500);
        } else if (userRole === 'BIDDER' || userRole === 'SELLER') {
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        }
      } else {
        throw new Error('Access token not received');
      }
    } catch (err: any) {
      const errorResponse = err.response?.data;

      if (errorResponse.data?.errorCode === 'USER_NOT_FOUND') {
        setError('Account not found. Please register to create an account.');
      } else if (errorResponse.data?.errorCode === 'INVALID_PASSWORD') {
        setError('Incorrect password. Did you forget your password?');
        setShowForgotPassword(true);
      } else {
        setError(errorResponse?.message || err.message);
      }

      setNotification({
        type: 'error',
        message: 'Login failed',
        visible: true
      });

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaVerified(false);
      setRecaptchaToken(null);
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
          src="https://www.scnsoft.com/blog-pictures/ecommerce/auction-website.png"
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Email"
                className={`w-full pl-10 pr-3 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-[#c3937c] ${errors.email ? 'border-[#c3937c]' : 'border-[#dfdfdf]'
                  }`}
                disabled={loading}
              />
              <p
                className={`mt-1 text-sm pl-3 transition-all ${errors.email ? 'text-[#c3937c] visible' : 'invisible'
                  }`}
              >
                {errors.email?.message ?? 'placeholder'}
              </p>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  placeholder="Password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-[#c3937c] ${errors.password ? 'border-[#c3937c]' : 'border-[#dfdfdf]'
                    }`}
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
              <p
                className={`mt-1 text-sm pl-3 transition-all ${errors.password ? 'text-[#c3937c] visible' : 'invisible'
                  }`}
              >
                {errors.password?.message ?? 'placeholder'}
              </p>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-[#c3937c] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                theme="light"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !recaptchaVerified}
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
          </form>

          {/* Terms and Sign Up */}
          <div className="text-center space-y-4">
            <p className="text-xs text-[#999999]">
              Signing up means you agree to the{' '}
              <a className="text-[#404040]">
                Privacy policy
              </a>
              ,{' '}
              <a className="text-[#404040]">
                Terms of Services
              </a>{' '}
              and{' '}
              <a className="text-[#404040]">
                Affiliate Terms
              </a>
              .
            </p>

            <p className="text-sm text-[#404040]">
              Wanna be out bidder?{' '}
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
