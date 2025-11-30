import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendVerificationCode } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { Notification } from "../../components/ui/Notification";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });
  
  const { setAuthLoading, isAuthLoading } = useAuth();

  useEffect(() => {
    // Parse email from location state or query params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email, redirect to sign up
      navigate("/signup");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      setNotification({
        type: 'error',
        message: 'Please enter the verification code',
        visible: true
      });
      return;
    }

    if (!email) {
      setError("Email is missing. Please try signing up again.");
      setNotification({
        type: 'error',
        message: 'Email is missing. Please try signing up again.',
        visible: true
      });
      return;
    }

    setLoading(true);
    setAuthLoading(true);
    
    try {
      const response = await verifyEmail({ email, verificationCode });
      setSuccess(response.message);
      setNotification({
        type: 'success',
        message: response.message || 'Email verified successfully!',
        visible: true
      });
      
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setNotification({
        type: 'error',
        message: err.message || 'Verification failed',
        visible: true
      });
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email is missing. Please try signing up again.");
      setNotification({
        type: 'error',
        message: 'Email is missing. Please try signing up again.',
        visible: true
      });
      return;
    }

    setResendLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await resendVerificationCode(email);
      setSuccess(response.message);
      setNotification({
        type: 'success',
        message: response.message || 'Verification code sent!',
        visible: true
      });
      setCountdown(60); // Disable resend for 60 seconds
    } catch (err: any) {
      setError(err.message);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to resend verification code',
        visible: true
      });
    } finally {
      setResendLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {isAuthLoading && (
        <LoadingOverlay message="Verifying your email..." fullScreen />
      )}
      
      <div className="w-full max-w-md p-8 m-auto bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-3xl font-semibold text-center text-[#c3937c]">Verify Your Email</h2>
        
        {email && (
          <p className="mb-4 text-center text-gray-700">
            We've sent a verification code to <strong>{email}</strong>. 
            Please enter the code below to verify your account.
          </p>
        )}

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-white bg-[#c3937c] rounded-md hover:bg-[#a87a65] focus:outline-none focus:ring-2 focus:ring-[#ead9c9] disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="mr-2">Verifying</span>
                <span className="animate-pulse">...</span>
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0}
            className="text-[#c3937c] hover:underline focus:outline-none disabled:opacity-50 disabled:hover:no-underline"
          >
            {countdown > 0
              ? `Resend code in ${countdown}s`
              : resendLoading
              ? "Sending..."
              : "Didn't receive a code? Resend"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-gray-600 hover:underline focus:outline-none"
            disabled={loading || resendLoading}
          >
            Back to Sign Up
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

export default VerifyEmail; 