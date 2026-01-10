import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { LoadingOverlay } from "./components/ui/LoadingOverlay";
import { getSystemSettingByKey } from "./api/systemSetting";
import { useSystemSettingStore } from "./stores/systemSettingStore";
import { Toaster } from "react-hot-toast";
const App: React.FC = () => {
  const setNewCreatedProduct = useSystemSettingStore(
    (state) => state.setNewCreatedProduct
  );
  const setTimeRemaining = useSystemSettingStore(
    (state) => state.setTimeRemaining
  );

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        // Fetch newCreatedProduct setting for ProductCard
        const newCreatedProductResponse = await getSystemSettingByKey("newCreatedProduct");
        console.log("✅ Success:", newCreatedProductResponse); // ← Thêm
        setNewCreatedProduct(newCreatedProductResponse.data.value);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Failed to fetch newCreatedProduct setting:", errorMessage);
        setNewCreatedProduct(null);
      }

      try {
        // Fetch timeRemaining setting for PDP (keep existing logic)
        const response = await getSystemSettingByKey("timeRemaining");
        setTimeRemaining(response.data.value);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Failed to fetch timeRemaining setting:", errorMessage);
        setTimeRemaining(null);
      }
    };

    fetchSystemSettings();
  }, [setNewCreatedProduct, setTimeRemaining]);

  return (
    <Router>
      <Toaster />
      <Suspense
        fallback={
          <LoadingOverlay message="Loading application..." fullScreen={true} />
        }
      >
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
