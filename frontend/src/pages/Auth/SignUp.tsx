import type React from "react"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import { register as registerApi } from "../../api/auth"
import { useAuth } from "../../context/AuthContext"
import { LoadingOverlay } from "../../components/ui/LoadingOverlay"
import { Notification } from "../../components/ui/Notification"

interface SignUpFormData {
  fullname: string
  email: string
  password: string
  address: string
  confirmPassword: string
}

interface InputFieldProps {
  id: string
  label: string
  type: string
  placeholder?: string
  disabled?: boolean
  registerProps: any
  error?: string
}

const InputField: React.FC<InputFieldProps> = ({ id, label, type, placeholder, disabled, registerProps, error }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[#404040]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...registerProps}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-3 border rounded-md disabled:opacity-50 disabled:bg-gray-100 ${
          error ? 'border-[#c3937c]' : 'border-[#dfdfdf]'
        }`}
      />
      {error && (
        <p className="text-sm text-[#c3937c]">{error}</p>
      )}
    </div>
  )
}

interface PasswordFieldProps {
  id: string
  label: string
  placeholder?: string
  disabled?: boolean
  registerProps: any
  error?: string
}

const PasswordField: React.FC<PasswordFieldProps> = ({ id, label, placeholder, disabled, registerProps, error }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[#404040]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          {...registerProps}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-3 border rounded-md pr-10 disabled:opacity-50 disabled:bg-gray-100 ${
            error ? 'border-[#c3937c]' : 'border-[#dfdfdf]'
          }`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868686]"
          aria-label={showPassword ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-[#c3937c]">{error}</p>
      ) : (
        <p className="text-sm text-[#868686]">Use 8 or more characters with a mix of letters, numbers & symbols</p>
      )}
    </div>
  )
}


const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  const { setAuthLoading, isAuthLoading } = useAuth();

  // Get reCAPTCHA site key from environment variable or use a placeholder
  // Replace with your actual reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_V2_CHECKBOX || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // This is Google's test key

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignUpFormData>({
    mode: 'onBlur', // Validate on blur
  });

  const handleRecaptchaChange = (value: string | null) => {
    console.log(value);
    setRecaptchaVerified(!!value);
    setRecaptchaToken(value);
  };

  const onSubmit = async (data: SignUpFormData) => {
    // Check if reCAPTCHA is verified
    if (!recaptchaVerified) {
      setApiError("Please complete the reCAPTCHA verification");
      setNotification({
        type: 'error',
        message: 'Please complete the reCAPTCHA verification',
        visible: true
      });
      return;
    }

    setApiError("");
    setLoading(true);
    setAuthLoading(true);

    try {
      // Add role and reCAPTCHA token for backend
      const { fullname, email, password, address } = data;
      const registerData = {
        fullname,
        email,
        password,
        address,
        role: "BIDDER", // Set default role
        recaptchaToken: recaptchaToken || undefined
      };
      await registerApi(registerData);
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Registration successful! Please check your email.',
        visible: true
      });

      // Redirect to email verification page after successful registration
      setTimeout(() => {
        navigate("/verify-email", {
          state: { email: data.email },
        });
      }, 2000);
    } catch (err: any) {
      setApiError(err.message);
      setNotification({
        type: 'error',
        message: 'Registration failed: ' + err.message,
        visible: true
      });
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaVerified(false);
        setRecaptchaToken(null);
      }
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };


  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative">
      <div className="w-full lg:w-1/2">
        <div className="h-64 lg:h-full relative">
          <img
            src="https://www.marketresearchintellect.com/images/blogs/revolutionizing-bidding-how-online-auction-software-is-transforming-the-market-in-2024.webp"
            alt="Bride in wedding dress"
            className="object-cover h-full w-full"
          />
        </div>
      </div>

      {/* Form đăng ký */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
        {isAuthLoading && (
          <LoadingOverlay message="Creating your account..." />
        )}

        <div className="max-w-md mx-auto w-full">
          <h1 className="text-[#c3937c] text-4xl font-medium mb-2">Sign up</h1>
          <p className="mb-8 text-[#404040]">
            Already have an account?{" "}
            <Link to="/signin" className="text-[#c3937c] hover:underline">
              Log in
            </Link>
          </p>

          {apiError && (
            <div className="mb-4 p-3 bg-[#ead9c9] text-[#c3937c] rounded-md">
              {apiError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              id="email"
              label="Email address"
              type="email"
              disabled={loading}
              registerProps={register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />

            <InputField
              id="fullname"
              label="Full name"
              type="text"
              disabled={loading}
              registerProps={register('fullname', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Full name must not exceed 100 characters'
                }
              })}
              error={errors.fullname?.message}
            />

            <InputField
              id="address"
              label="Address"
              type="text"
              disabled={loading}
              registerProps={register('address', {
                required: 'Address is required',
                minLength: {
                  value: 5,
                  message: 'Address must be at least 5 characters'
                },
                maxLength: {
                  value: 200,
                  message: 'Address must not exceed 255 characters'
                }
              })}
              error={errors.address?.message}
            />

            <PasswordField
              id="password"
              label="Password"
              disabled={loading}
              registerProps={register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
              error={errors.password?.message}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              disabled={loading}
              registerProps={register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value: string) =>
                  value === getValues('password') || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                theme="light"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !recaptchaVerified}
              className="w-full bg-[#ead9c9] text-[#404040] py-3 rounded-full hover:bg-[#c3937c] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="mr-2">Creating account</span>
                  <span className="animate-pulse">...</span>
                </>
              ) : "Create an account"}
            </button>
          </form>


          {/* Add Terms and Guest Link */}
          <div className="mt-8 text-center text-sm">
            <p className="text-xs text-[#868686] mb-4">
              Signing up means you agree to the{" "}
              <a className="text-[#c3937c]">
                Privacy policy
              </a>
              ,{" "}
              <a className="text-[#c3937c]">
                Terms of Services
              </a>{" "}
              and{" "}
              <a className="text-[#c3937c]">
                Affiliate Terms
              </a>
              .
            </p>
            <p className="text-[#404040]">
              Just don't want to sign up?{" "}
              <Link to="/" className="text-[#c3937c] font-medium hover:underline">
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

export default SignUp;

