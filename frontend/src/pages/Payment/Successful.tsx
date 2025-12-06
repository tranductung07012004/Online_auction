import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Successful: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up all temporary checkout data
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('photography_cart_items');
    localStorage.removeItem('photography_items_in_process');
    sessionStorage.removeItem('shippingAddress');
    
    // Other cleanup that might be needed
    console.log('Cleaned up checkout data after successful payment');
  }, []);
  
  const handleGoToOrderHistory = () => {
    navigate('/order-history');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Thanh toán đặt cọc thành công!</h1>
        <p className="text-lg text-gray-700 mb-8">
          Cảm ơn bạn đã thanh toán. Chúng tôi đang xử lý đơn hàng của bạn và sẽ gửi hóa đơn chi tiết trong thời gian
          sớm nhất.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tiếp theo sẽ như thế nào?</h2>
          <div className="space-y-4 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#c3937c] flex items-center justify-center text-white font-medium">1</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium">Xác nhận đơn hàng</h3>
                <p className="text-gray-600">
                  Bạn sẽ nhận được email/xác nhận với thông tin chi tiết đơn hàng và số tiền đã đặt cọc.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#c3937c] flex items-center justify-center text-white font-medium">2</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium">Chuẩn bị đơn hàng</h3>
                <p className="text-gray-600">
                  Đội ngũ của chúng tôi sẽ chuẩn bị sản phẩm theo thông tin bạn đã cung cấp.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#c3937c] flex items-center justify-center text-white font-medium">3</div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium">Gửi hóa đơn</h3>
                <p className="text-gray-600">
                  Sau khi đơn hàng được xác nhận, người bán sẽ gửi lại hóa đơn chi tiết. Sau khi nhận được, bạn hãy xác
                  nhận đã nhận hóa đơn để hoàn tất bước này.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGoToOrderHistory}
            className="inline-block rounded-md bg-[#c3937c] px-6 py-3 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
          >
            Xem lịch sử đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default Successful; 