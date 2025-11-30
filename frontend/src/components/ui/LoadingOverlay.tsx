import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  const overlayClasses = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10';

  return (
    <div className={`${overlayClasses} bg-black/20 backdrop-blur-sm flex items-center justify-center`}>
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-[#c3937c] animate-spin" />
        <p className="mt-2 text-gray-800">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 