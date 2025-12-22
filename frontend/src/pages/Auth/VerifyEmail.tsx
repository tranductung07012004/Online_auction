import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/auth";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";

type VerifyStatus = "verifying" | "success" | "error";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [message, setMessage] = useState<string>("");

  const verifyEmailLink = async (otp: string, email: string, userId: number) => {
    setStatus("verifying");
    try {
      const response = await verifyOtp({ userId, otp, email });
      setMessage(response.message);
      setStatus("success");

      setTimeout(() => navigate("/signin"), 1500);
    } catch (err: any) {
      const errorCode = err.response.data.data?.errorCode;
      const apiMessage =
        err.response.data.message;
      setMessage(apiMessage);
      setStatus("error");
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const otp = searchParams.get("otp");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!otp || !email || !userId) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const parsedUserId = Number(userId);
    if (Number.isNaN(parsedUserId)) {
      setStatus("error");
      setMessage("Invalid user information in the verification link.");
      return;
    }

    verifyEmailLink(otp, email, parsedUserId);
  }, [location.search]);

  const isVerifying = status === "verifying";
  const isSuccess = status === "success";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      {isVerifying && (
        <LoadingOverlay message="Verifying your email..." fullScreen />
      )}

      {!isVerifying && (
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-semibold text-[#c3937c]">
              Email Verification
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSuccess
                ? "Your email has been verified successfully."
                : "We could not verify your email."}
            </p>
          </div>

          <div
            className={`mb-6 rounded-md p-3 text-sm ${
              isSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/signin")}
              className="w-full rounded-md bg-[#c3937c] py-2 text-white hover:bg-[#a87a65]"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full rounded-md border border-gray-200 py-2 text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;