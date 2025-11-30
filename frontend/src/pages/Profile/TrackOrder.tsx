import { OrderProgress } from './profile/progress';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../api/user';
import { UserProfile } from '../../api/user';
import { trackOrderByPhone } from '../../api/order';
import Notification from '../../components/ui/Notification';

// Define các kiểu dữ liệu
interface OrderItem {
  id: string;
  orderCode: string;
  productName: string;
  quantity: number;
  price: number;
  status: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  deliveryDate?: string;
}

interface TrackingData {
  orderCode: string;
  status: string;
  trackingInfo: TrackingInfo | null;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  items: OrderItem[];
  customerInfo: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
}

const TrackOrderPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [trackingDataList, setTrackingDataList] = useState<TrackingData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ visible: false, type: 'info', message: '' });

  const handleTrackOrder = async () => {
    if (!phone.trim()) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Vui lòng nhập số điện thoại'
      });
      return;
    }
    
    // Xóa dấu cách, dấu +, dấu gạch nối nếu có
    const formattedPhone = phone.trim().replace(/[\s+\-]/g, '');
    
    // Kiểm tra định dạng số điện thoại
    if (!/^\d{10,11}$/.test(formattedPhone)) {
      setNotification({
        visible: true,
        type: 'error',
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.'
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await trackOrderByPhone(formattedPhone);
      console.log('API response data:', data);
      
      // Kiểm tra dữ liệu trả về
      if (!Array.isArray(data)) {
        console.error('Data không phải là mảng:', data);
        setError('Lỗi định dạng dữ liệu từ server');
        setTrackingDataList([]);
        setSelectedOrder(null);
        setLoading(false);
        return;
      }
      
      setTrackingDataList(data);
      setSelectedOrder(data.length > 0 ? data[0] : null);
      setLoading(false);
      
      if (data.length > 1) {
        setNotification({
          visible: true,
          type: 'info',
          message: `Tìm thấy ${data.length} đơn hàng với số điện thoại này`
        });
      }
    } catch (err: any) {
      console.error('Error tracking order by phone:', err);
      setError(err.message || 'Không tìm thấy đơn hàng với số điện thoại này');
      setTrackingDataList([]);
      setSelectedOrder(null);
      setLoading(false);
      
      setNotification({
        visible: true,
        type: 'error',
        message: err.message || 'Không tìm thấy đơn hàng với số điện thoại này'
      });
    }
  };
  
  const selectOrder = (orderCode: string) => {
    const selected = trackingDataList.find(order => order.orderCode === orderCode);
    if (selected) {
      setSelectedOrder(selected);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          visible={notification.visible}
          onClose={() => setNotification({ ...notification, visible: false })}
        />
      )}
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="track-order"
              userName={userData ? userData.username : 'User'}
              userImage={userData?.profileImageUrl}
              fullName={userData ? `${userData.firstName} ${userData.lastName}` : undefined}
            />
          </div>

          <div className="md:col-span-2 bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-medium">Theo dõi đơn hàng</h1>
              {selectedOrder && (
                <span className="text-gray-600">Mã đơn hàng: {selectedOrder.orderCode}</span>
              )}
            </div>
            
            {trackingDataList.length > 0 && selectedOrder ? (
              <>
                {trackingDataList.length > 1 && (
                  <div className="mb-6 border p-3 rounded bg-gray-50">
                    <h3 className="font-medium mb-2">Chọn đơn hàng cần xem:</h3>
                    <div className="flex flex-wrap gap-2">
                      {/* Xóa console.log khỏi JSX vì gây lỗi TypeScript */}
                      {trackingDataList.map((order, index) => {
                        // Ghi log bên ngoài phần return của JSX
                        if (process.env.NODE_ENV !== 'production') {
                          console.log(`Order ${index}:`, order.orderCode);
                        }
                        return (
                          <button 
                            key={`order-${order.orderCode || 'unknown'}-${index}`}
                            onClick={() => selectOrder(order.orderCode)}
                            className={`px-3 py-1 rounded text-sm ${selectedOrder?.orderCode === order.orderCode ? 'bg-[#c3937c] text-white' : 'bg-gray-200'}`}
                            style={{ minWidth: '120px', textAlign: 'center', fontWeight: 500 }}
                          >
                            {order.orderCode || `Đơn hàng ${index + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-b py-4">
                  <OrderProgress 
                    currentStatus={
                      selectedOrder.status === 'processing' ? 'placed' :
                      selectedOrder.status === 'packed' ? 'packed' :
                      selectedOrder.status === 'delivered' ? 'delivered' :
                      selectedOrder.status === 'returned' ? 'delivered' : 'placed'
                    } 
                  />
                </div>

                {selectedOrder.trackingInfo && (
                  <div className="py-6">
                    <h2 className="text-lg font-medium mb-2">
                      {selectedOrder.status === 'delivered' 
                        ? 'Đơn hàng của bạn đã được giao' 
                        : selectedOrder.status === 'returned'
                          ? 'Đơn hàng đã được trả lại'
                          : 'Đơn hàng đang được xử lý'}
                    </h2>
                    <p className="text-gray-600">
                      {selectedOrder.trackingInfo.carrier} (Mã vận đơn: #{selectedOrder.trackingInfo.trackingNumber})
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Chi tiết đơn hàng</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã đơn hàng</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Số lượng</TableHead>
                          <TableHead>Giá</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.orderCode}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price.toLocaleString()} đ</TableCell>
                            <TableCell>
                              {item.status === 'confirmed' ? 'Đã xác nhận' :
                               item.status === 'pending' ? 'Đang xử lý' :
                               item.status === 'delivered' ? 'Đã giao' :
                               item.status === 'returned' ? 'Đã trả lại' :
                               item.status}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-2">Thông tin khách hàng</h3>
                    <p><strong>Tên:</strong> {selectedOrder.customerInfo.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerInfo.email}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.customerInfo.phone}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.customerInfo.address}</p>
                    <p><strong>Tổng tiền:</strong> {selectedOrder.totalAmount.toLocaleString()} đ</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <p>Nhập số điện thoại để theo dõi đơn hàng</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  onClick={handleTrackOrder} 
                  className="whitespace-nowrap"
                  disabled={loading}
                >
                  {loading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrderPage;
