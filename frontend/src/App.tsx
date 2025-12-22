import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { LoadingOverlay } from './components/ui/LoadingOverlay';

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingOverlay message="Loading application..." fullScreen={true} />}>
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
