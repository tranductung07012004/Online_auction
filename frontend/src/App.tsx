import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { getSystemSettingByKey } from './api/systemSetting';
import { useSystemSettingStore } from './stores/systemSettingStore';
import { Toaster } from 'react-hot-toast';
const App: React.FC = () => {
  const setTimeRemaining = useSystemSettingStore((state) => state.setTimeRemaining);

  useEffect(() => {
    const fetchSystemSetting = async () => {
      try {
        const response = await getSystemSettingByKey('timeRemaining');
        setTimeRemaining(response.data.value);
      } catch (error: any) {
        const errorCode = error.response.data.data?.errorCode;
        const errorMessage = error.response.data.message;
        console.error('Failed to fetch system setting:', errorMessage);
      }
    };

    fetchSystemSetting();
  }, [setTimeRemaining]);

  return (
    <Router>
      <Toaster/>
      <Suspense fallback={<LoadingOverlay message="Loading application..." fullScreen={true} />}>
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
