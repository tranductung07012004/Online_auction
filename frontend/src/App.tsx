import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import AppRoutes from './routes/AppRoutes';
import { LoadingOverlay } from './components/ui/LoadingOverlay';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Suspense fallback={<LoadingOverlay message="Loading application..." fullScreen={true} />}>
            <AppRoutes />
          </Suspense>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
