import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Notification } from '../../components/ui/Notification';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });
  
  const { setAuthLoading, isAuthLoading } = useAuth();

  useEffect(() => {
    // Get email from location state
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.resetCode) {
      setError('Reset code is required');
      setNotification({
        type: 'error',
        message: 'Reset code is required',
        visible: true
      });
      return;
    }
    
    if (!formData.newPassword) {
      setError('New password is required');
      setNotification({
        type: 'error',
        message: 'New password is required',
        visible: true
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setNotification({
        type: 'error',
        message: 'Password must be at least 6 characters long',
        visible: true
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setNotification({
        type: 'error',
        message: 'Passwords do not match',
        visible: true
      });
      return;
    }

    setLoading(true);
    setAuthLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await resetPassword(formData);
      setSuccess(response.message);
      setNotification({
        type: 'success',
        message: response.message || 'Password reset successful!',
        visible: true
      });
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      setNotification({
        type: 'error',
        message: err.message || 'Failed to reset password',
        visible: true
      });
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      {isAuthLoading && (
        <LoadingOverlay message="Resetting your password..." fullScreen />
      )}
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-medium text-center text-[#c3937c] mb-6">
          Reset Password
        </h1>
        
        <p className="text-gray-600 mb-6 text-center">
          Enter the reset code we sent to your email and create a new password.
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Reset Code
            </label>
            <input
              type="text"
              name="resetCode"
              value={formData.resetCode}
              onChange={handleChange}
              placeholder="Enter the 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-[#999999]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                required
                minLength={6}
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
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-[#999999]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-[#e3b186] text-[#505050] rounded-full font-medium hover:bg-[#c3937c] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="mr-2">Resetting password</span>
                <span className="animate-pulse">...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/signin')}
            className="text-[#c3937c] hover:underline"
            disabled={loading}
          >
            Back to Sign In
          </button>
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

export default ResetPassword; 