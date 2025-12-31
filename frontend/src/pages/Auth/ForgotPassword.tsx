import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Notification } from '../../components/ui/Notification';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });
  
  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setAuthLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await requestPasswordReset({ email });
      setSuccess(response.message);
      setNotification({
        type: 'success',
        message: 'Reset code sent to your email',
        visible: true
      });
      
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
      setNotification({
        type: 'error',
        message: 'Failed to send reset code: ' + (err.message || 'Unknown error'),
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
        <LoadingOverlay message="Sending reset code..." fullScreen />
      )}
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-medium text-center text-[#c3937c] mb-6">
          Forgot Password
        </h1>
        
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a code to reset your password.
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

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex w-full items-center rounded-md border border-[#cbcbcb] px-3 py-2 focus-within:border-[#c3937c] focus-within:ring-1 focus-within:ring-[#c3937c]">
              <Mail className="mr-2 h-5 w-5 text-[#868686]" />
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 border-0 bg-transparent outline-none placeholder:text-[#868686] focus:outline-none focus:ring-0 disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mb-6 w-full rounded-[100px] bg-[#e3b186] py-3 text-[#505050] font-[600] hover:bg-[#dfdfdf] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="mr-2">Sending</span>
                <span className="animate-pulse">...</span>
              </>
            ) : 'Send Reset Code'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/signin')}
            className="mb-6 w-full rounded-[100px] font-[600] bg-[#f5f5f5] py-3 text-[#505050] hover:bg-[#dfdfdf] transition-colors cursor-pointer disabled:opacity-50"
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

export default ForgotPassword;
