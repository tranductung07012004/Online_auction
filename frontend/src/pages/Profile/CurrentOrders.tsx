import { useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import { OrderFilterTabs } from './profile/order-filter-tabs';
import { OrderCard } from './profile/order-card';
import Footer from '../../components/footer';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../api/user';
import { getUserOrders, cancelOrder } from '../../api/order';
import { getCart, clearCart } from '../../api/cart';
import { getPhotographyCart } from '../../api/photographyCart';
import {
  getUserPhotographyBookings,
  PhotographyBooking,
} from '../../api/photography';
import { UserProfile } from '../../api/user';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';

type OrderFilterTab = 'current' | 'previous' | 'canceled' | 'all';

export interface OrderItem {
  id: string;
  orderId?: string; // Reference to parent order
  orderIndex?: number; // Item index within the order
  itemCount?: number; // Total number of items in this order
  name: string;
  image: string;
  size: string;
  color: string;
  rentalDuration: string;
  arrivalDate: string;
  returnDate: string;
  status:
    | 'done'
    | 'pending'
    | 'under-review'
    | 'canceled'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'returned'
    | 'cancelled'
    | 'Pending'
    | 'Confirmed'
    | 'Cancelled'
    | 'Completed'
    | 'In Cart';
  isCartItem?: boolean;
  isPaid?: boolean;
  purchaseType?: 'rent' | 'buy' | 'service';
  isPhotographyService?: boolean;
  additionalDetails?: string;
}

// Map backend status to frontend status
const mapOrderStatus = (
  backendStatus: string,
): 'done' | 'pending' | 'under-review' | 'canceled' | 'confirmed' | 'shipped' | 'delivered' | 'returned' => {
  const statusMap: Record<
    string,
    | 'done'
    | 'pending'
    | 'under-review'
    | 'canceled'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'returned'
  > = {
    pending: 'pending',
    confirmed: 'confirmed',
    shipped: 'shipped', // Add shipped status
    delivered: 'delivered', // Map delivered to delivered instead of done
    cancelled: 'canceled', // Note different spelling
    canceled: 'canceled',
    returned: 'returned', // Add returned status
    'under-review': 'under-review',
    done: 'done',
    paid: 'done', // Map paid status to done so it shows in previous orders
  };

  // Log for debugging
  console.log(
    `Mapping backend status "${backendStatus}" to frontend status "${statusMap[backendStatus.toLowerCase()] || 'pending'}"`,
  );
  console.log(
    `Is this a paid order? ${backendStatus.toLowerCase() === 'paid'}`,
  );

  return statusMap[backendStatus.toLowerCase()] || 'pending'; // Default to pending if status unknown
};

const CurrentOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('current');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        console.log('Fetching user orders...');
        const ordersData = await getUserOrders();
        console.log(
          'Raw orders data received:',
          JSON.stringify(ordersData, null, 2),
        );

        // Transform the orders data to match OrderItem structure
        console.log('Transforming orders data to match UI requirements');
        const formattedOrders: OrderItem[] = [];

        if (ordersData && ordersData.length > 0) {
          ordersData.forEach((order) => {
            console.log('Processing order:', order._id);
            console.log('Order status:', order.status);

            // Check if order has items
            if (!order.items || order.items.length === 0) {
              console.warn('Order has no items:', order._id);
              return;
            }

            // Map backend status to frontend status
            const mappedStatus = mapOrderStatus(order.status);
            console.log(
              `Mapped status from "${order.status}" to "${mappedStatus}"`,
            );

            // Only add non-paid orders to current orders
            if (order.status.toLowerCase() !== 'paid') {
              // Process all items in the order, not just the first one
              order.items.forEach((item, itemIndex) => {
                formattedOrders.push({
                  id: `${order._id}-item-${itemIndex}`, // Unique ID for each item
                  orderId: order._id, // Reference to parent order
                  orderIndex: itemIndex, // Index within the order
                  itemCount: order.items.length, // Total items in this order
                  name: item.name,
                  image: item.image,
                  size: item.size,
                  color: item.color,
                  purchaseType: item.purchaseType || 'rent',
                  rentalDuration: `${Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))} Nights`,
                  arrivalDate: new Date(
                    order.arrivalDate || order.startDate,
                  ).toLocaleDateString(),
                  returnDate: new Date(
                    order.returnDate || order.endDate,
                  ).toLocaleDateString(),
                  status: mappedStatus
                });
              });
            }
          });
        }

        // Only fetch cart items if we need them (when viewing current orders)
        if (activeTab === 'current') {
          console.log('Fetching cart items...');
          
          // Add photography cart items 
          try {
            // Import và sử dụng getPhotographyCart
            const { getPhotographyCart } = await import('../../api/photographyCart');
            const photographyCartItems = await getPhotographyCart();
            console.log('Photography cart items:', photographyCartItems);
            
            if (photographyCartItems && photographyCartItems.length > 0) {
              // Add photography items as cart items with "In Cart" status
              photographyCartItems.forEach((item) => {
                formattedOrders.push({
                  id: `photography-cart-item-${item.serviceId}`,
                  name: item.serviceName,
                  image: item.imageUrl,
                  size: item.serviceType,
                  color: item.location || 'Studio',
                  rentalDuration: 'Photography Service',
                  arrivalDate: new Date(item.bookingDate).toLocaleDateString(),
                  returnDate: new Date(item.bookingDate).toLocaleDateString(),
                  status: 'In Cart',
                  isCartItem: true,
                  isPhotographyService: true,
                  purchaseType: 'service'
                });
              });
            }
          } catch (photoCartErr) {
            console.error('Error fetching photography cart items:', photoCartErr);
          }
          
          // Add dress items from cart
          try {
            console.log('Fetching dress cart items...');
            const dressCartItems = await getCart();
            console.log('Dress cart items:', dressCartItems);
            
            if (dressCartItems && dressCartItems.items && dressCartItems.items.length > 0) {
              // Add dress items as cart items with "In Cart" status
              dressCartItems.items.forEach((item) => {
                formattedOrders.push({
                  id: `dress-cart-item-${item._id || Math.random().toString(36).substring(7)}`,
                  name: item.name,
                  image: item.image,
                  size: item.size,
                  color: item.color,
                  rentalDuration: item.startDate && item.endDate
                    ? `${Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24))} Nights`
                    : 'N/A',
                  arrivalDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A',
                  returnDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A',
                  status: 'In Cart',
                  isCartItem: true,
                  purchaseType: item.purchaseType || 'rent'
                });
              });
            }
          } catch (cartErr) {
            console.error('Error fetching dress cart items:', cartErr);
          }
        }

        // Fetch photography bookings
        try {
          const photographyBookings = await getUserPhotographyBookings();
          console.log(
            '===DEBUG=== Photography bookings from API:',
            photographyBookings,
          );

          if (photographyBookings && photographyBookings.length > 0) {
            photographyBookings.forEach((booking) => {
              // Map photography booking status to frontend status
              // Just use the original status without mapping
              const statusMapping = booking.status;
              console.log(
                '===DEBUG=== Processing booking:',
                booking._id,
                'with status:',
                statusMapping,
              );

              // Show all photography bookings, not just ones with payment details
              formattedOrders.push({
                id: booking._id,
                name: booking.serviceId?.name || 'Photography Service',
                image:
                  booking.serviceId?.imageUrls?.[0] ||
                  booking.serviceId?.images?.[0] ||
                  booking.serviceId?.coverImage ||
                  '/placeholder-photography.jpg',
                size: booking.serviceId?.packageType || 'Standard',
                color: booking.shootingLocation || 'Studio',
                rentalDuration: 'Photography Service',
                arrivalDate: new Date(
                  booking.shootingDate,
                ).toLocaleDateString(),
                returnDate: new Date(booking.shootingDate).toLocaleDateString(),
                status: statusMapping,
                isPhotographyService: true,
                purchaseType: 'service',
                additionalDetails: booking.additionalRequests,
              });
            });
          }
        } catch (photoBookingsErr) {
          console.error(
            'Error fetching photography bookings:',
            photoBookingsErr,
          );
        }

        console.log('Final formatted orders:', formattedOrders);

        // Use different deduplication strategies for different order types
        const uniqueOrderMap = new Map<string, OrderItem>();
        formattedOrders.forEach((order: OrderItem) => {
          // For photography services, use ID as unique key to preserve all bookings
          if (order.isPhotographyService) {
            const key = order.id;
            uniqueOrderMap.set(key, order);
          } else if (order.isCartItem) {
            // For cart items, use the existing deduplication logic
            const key = `${order.name}-${order.size}-${order.color}`;
            if (
              !uniqueOrderMap.has(key) ||
              (uniqueOrderMap.get(key)?.isCartItem && !order.isCartItem)
            ) {
              uniqueOrderMap.set(key, order);
            }
          } else {
            // For regular orders, each item needs to be preserved
            // Use the unique ID we created earlier
            const key = order.id;
            uniqueOrderMap.set(key, order);
          }
        });

        // Convert back to array
        const deduplicatedOrders = Array.from(uniqueOrderMap.values())
          // Don't filter out cart items anymore - we want to show them
          // .filter(order => !order.isCartItem);
        console.log('Deduplicated orders:', deduplicatedOrders);

        setOrders(deduplicatedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (err instanceof Error) {
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, activeTab]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    // For photography services, debug the status check
    if (order.isPhotographyService) {
      const status = order.status ? order.status.toLowerCase() : '';
      console.log(
        '===DEBUG=== Filtering photo order:',
        order.id,
        'Status:',
        order.status,
        'Tab:',
        activeTab,
      );

      let shouldShow = false;
      if (activeTab === 'current')
        shouldShow = status === 'pending' || status === 'confirmed' || order.isCartItem === true || status === 'in cart';
      if (activeTab === 'previous') shouldShow = status === 'completed';
      if (activeTab === 'canceled')
        shouldShow = status === 'cancelled' || status === 'canceled';
      if (activeTab === 'all') shouldShow = true;

      console.log('===DEBUG=== Should show?', shouldShow);
      return shouldShow;
    }

    // For regular orders and cart items, use the existing logic
    if (activeTab === 'current') {
      // Show pending, under-review, and confirmed in current orders
      return (
        order.status === 'pending' ||
        order.status === 'under-review' ||
        order.status === 'confirmed' ||
        order.status === 'shipped' ||
        order.status === 'In Cart' ||
        order.isCartItem === true
      );
    }
    if (activeTab === 'previous')
      return (
        order.status === 'done' ||
        order.status === 'delivered' ||
        order.status === 'returned'
      );
    if (activeTab === 'canceled')
      return order.status === 'canceled' || order.status === 'cancelled';
    return true;
  });

  console.log('===DEBUG=== Active tab:', activeTab);
  console.log('===DEBUG=== Final filtered orders:', filteredOrders);

  // Handle canceling/deleting an order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      setLoading(true);

      // Check if this is a cart item
      if (orderId.startsWith('cart-item-')) {
        // Extract the index from the cart-item-X pattern
        const itemIndex = parseInt(orderId.replace('cart-item-', ''), 10);

        // For cart items, we use removeFromCart instead of cancelOrder
        const { removeFromCart } = await import('../../api/cart');
        await removeFromCart(itemIndex);

        toast.success('Item removed from cart successfully');
      } else if (orderId.startsWith('photography-cart-item-')) {
        // Extract the serviceId from the photography-cart-item-X pattern
        const serviceId = orderId.replace('photography-cart-item-', '');
        
        // For photography cart items, use removePhotographyFromCart
        const { removePhotographyFromCart } = await import('../../api/photographyCart');
        await removePhotographyFromCart(serviceId);
        
        toast.success('Photography service removed from cart successfully');
      } else if (orderId.startsWith('dress-cart-item-')) {
        // Extract the item index from the ID
        const idParts = orderId.split('-');
        const itemIndex = parseInt(idParts[idParts.length - 1]);
        
        if (!isNaN(itemIndex)) {
          // For dress cart items, use removeFromCart
          await removeFromCart(itemIndex);
          
          // Show success message
          toast.success('Dress removed from cart successfully');
        } else {
          toast.error('Invalid item index');
        }
      } else {
        // For actual orders, use cancelOrder
        await cancelOrder(orderId);
        toast.success('Order canceled successfully');
      }

      // Refresh the orders list
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId),
      );
    } catch (err: any) {
      console.error('Failed to delete order:', err);
      toast.error(err.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="current-orders"
              userName={userData ? userData.username : 'User'}
              userImage={userData?.profileImageUrl}
              fullName={
                userData
                  ? `${userData.firstName} ${userData.lastName}`
                  : undefined
              }
            />
          </div>

          <div className="md:col-span-2">
            <OrderFilterTabs
              defaultTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onDelete={undefined}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <p className="text-gray-500">No {activeTab} orders found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CurrentOrdersPage;
