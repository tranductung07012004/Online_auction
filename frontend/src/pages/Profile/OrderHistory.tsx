import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import { OrderFilterTabs } from './profile/order-filter-tabs';
import { OrderCard, type OrderItem } from './profile/order-card';
import Footer from '../../components/footer';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../api/user';
import { getUserOrders } from '../../api/order';
import { getCart, removeFromCart } from '../../api/cart';
import {
  getUserPhotographyBookings,
  PhotographyBooking,
} from '../../api/photography';
import { UserProfile } from '../../api/user';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';

type OrderFilterTab = 'current' | 'previous' | 'canceled' | 'all';

// Map backend status to frontend status
const mapOrderStatus = (
  backendStatus: string,
):
  | 'done'
  | 'pending'
  | 'under-review'
  | 'canceled'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'returned' => {
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
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'canceled',
    canceled: 'canceled',
    returned: 'returned',
    'under-review': 'under-review',
    done: 'done',
    paid: 'done',
  };

  return statusMap[backendStatus.toLowerCase()] || 'pending';
};

// Map photography booking status to frontend status
const mapPhotographyStatus = (status: string): string => {
  // Just return the original status without mapping
  return status;
};

export default function OrderHistory(): JSX.Element {
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('previous');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  console.log('OrderHistory component rendering with activeTab:', activeTab);

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

      console.log('========= ORDER HISTORY DEBUG =========');
      console.log('Current activeTab in fetchOrders:', activeTab);
      
      setLoading(true);
      try {
        const ordersData = await getUserOrders();
        console.log('Raw orders data from API:', ordersData ? ordersData.length : 0, 'items');

        // Transform the orders data to match OrderItem structure
        const formattedOrders: OrderItem[] = [];

        if (ordersData && ordersData.length > 0) {
          ordersData.forEach((order) => {
            // Check if order has items
            if (!order.items || order.items.length === 0) {
              return;
            }

            // Map backend status to frontend status
            const mappedStatus = mapOrderStatus(order.status);
            
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
                rentalDuration:
                  order.startDate && order.endDate
                    ? `${Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))} Nights`
                    : 'N/A',
                arrivalDate: order.arrivalDate
                  ? new Date(order.arrivalDate).toLocaleDateString()
                  : order.startDate
                    ? new Date(order.startDate).toLocaleDateString()
                    : 'N/A',
                returnDate: order.returnDate
                  ? new Date(order.returnDate).toLocaleDateString()
                  : order.endDate
                  ? new Date(order.endDate).toLocaleDateString()
                  : 'N/A',
                status: mappedStatus,
                isPaid: order.status.toLowerCase() === 'paid',
              });
            });
          });
        }

        // Fetch photography bookings
        try {
          const photographyBookings = await getUserPhotographyBookings();
          console.log('Photography bookings count:', photographyBookings ? photographyBookings.length : 0);

          if (photographyBookings && photographyBookings.length > 0) {
            // Show all photography bookings, not just ones with payment details
            photographyBookings.forEach((booking) => {
              console.log('Processing photography booking:', booking._id, 'with status:', booking.status);
              formattedOrders.push({
                id: booking._id,
                name: booking.serviceId?.name || 'Photography Service',
                image:
                  booking.serviceId?.imageUrls?.[0] ||
                  booking.serviceId?.images?.[0] ||
                  booking.serviceId?.coverImage ||
                  '/placeholder-photography.jpg',
                size: booking.serviceId?.packageType || 'Standard Package',
                color: booking.shootingLocation || 'Studio',
                rentalDuration: 'Photography Service',
                arrivalDate: new Date(
                  booking.shootingDate,
                ).toLocaleDateString(),
                returnDate: new Date(booking.shootingDate).toLocaleDateString(),
                status: booking.status, // Use status directly without mapping
                isPhotographyService: true,
                purchaseType: 'service',
                additionalDetails: booking.additionalRequests,
              });
            });
          }
        } catch (photoErr) {
          console.error('Error fetching photography bookings:', photoErr);
        }

        // Add photography cart items
        try {
          const { getPhotographyCart } = await import('../../api/photographyCart');
          const photographyCartItems = await getPhotographyCart();
          console.log('Photography cart items count:', photographyCartItems ? photographyCartItems.length : 0);
          
          if (photographyCartItems && photographyCartItems.length > 0) {
            // Add photography items as cart items with "In Cart" status
            photographyCartItems.forEach((item) => {
              console.log('Adding photography cart item:', item.serviceName);
              formattedOrders.push({
                id: `photography-cart-item-${item.serviceId}`,
                name: item.serviceName,
                image: item.imageUrl,
                size: item.serviceType,
                color: item.location || 'Studio',
                rentalDuration: 'Photography Service',
                arrivalDate: new Date(item.bookingDate).toLocaleDateString(),
                returnDate: new Date(item.bookingDate).toLocaleDateString(),
                status: 'In Cart', // Set status explicitly to "In Cart"
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
          console.log('Attempting to fetch dress cart items...');
          // Use the imported getCart function directly
          const cartResponse = await getCart();
          console.log('Full cart response:', JSON.stringify(cartResponse, null, 2));
          
          // Check different possible structures of the response
          let cartItems = [];
          
          if (cartResponse && cartResponse.items && Array.isArray(cartResponse.items)) {
            // Standard structure: { items: [...] }
            cartItems = cartResponse.items;
            console.log('Found items array in cart response with', cartItems.length, 'items');
          } else if (cartResponse && Array.isArray(cartResponse)) {
            // Alternative structure: direct array
            cartItems = cartResponse;
            console.log('Cart response is direct array with', cartItems.length, 'items');
          } else if (cartResponse && cartResponse.data && cartResponse.data.items && Array.isArray(cartResponse.data.items)) {
            // Nested structure: { data: { items: [...] } }
            cartItems = cartResponse.data.items;
            console.log('Found items in nested data structure with', cartItems.length, 'items');
          } else {
            console.log('Cart structure not recognized:', typeof cartResponse);
          }
          
          console.log('Cart items to process:', cartItems.length);
          
          if (cartItems.length > 0) {
            // Add dress items as cart items with "In Cart" status
            cartItems.forEach((item, index) => {
              console.log(`Processing dress cart item ${index}:`, item);
              
              // Create a safe ID for the cart item
              const itemId = item._id || `index-${index}`;
              console.log(`Item ID for cart item ${index}:`, itemId);
              
              // Extract necessary fields with fallbacks
              const name = item.name || 'Unnamed Item';
              const image = item.image || '/placeholder-dress.jpg';
              const size = item.size || 'Standard';
              const color = item.color || 'Default';
              
              formattedOrders.push({
                id: `dress-cart-item-${itemId}`,
                name,
                image,
                size,
                color,
                rentalDuration: item.startDate && item.endDate
                  ? `${Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24))} Nights`
                  : 'N/A',
                arrivalDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A',
                returnDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A',
                status: 'In Cart',
                isCartItem: true,
                purchaseType: item.purchaseType || 'rent'
              });
              
              console.log(`Added dress cart item ${index} to formatted orders`);
            });
          } else {
            console.log('No dress cart items found or empty array');
          }
        } catch (cartErr) {
          console.error('Error fetching dress cart items:', cartErr);
          console.error('Error details:', cartErr instanceof Error ? cartErr.message : String(cartErr));
        }

        console.log('Total formatted orders before deduplication:', formattedOrders.length);
        console.log('Order types breakdown:');
        console.log('- Regular orders:', formattedOrders.filter(o => !o.isPhotographyService && !o.isCartItem).length);
        console.log('- Photography services:', formattedOrders.filter(o => o.isPhotographyService && !o.isCartItem).length);
        console.log('- Photography cart items:', formattedOrders.filter(o => o.isPhotographyService && o.isCartItem).length);
        console.log('- Dress cart items:', formattedOrders.filter(o => !o.isPhotographyService && o.isCartItem).length);

        // Use different deduplication strategies for different order types
        const uniqueOrderMap = new Map();
        formattedOrders.forEach((order) => {
          // For photography services, use ID as unique key to preserve all bookings
          if (order.isPhotographyService) {
            const key = order.id;
            uniqueOrderMap.set(key, order);
          } else if (order.isCartItem) {
            // For cart items, use the existing deduplication logic
            const key = `${order.name}-${order.size}-${order.color}`;
            if (
              !uniqueOrderMap.has(key) ||
              (uniqueOrderMap.get(key).isCartItem && !order.isCartItem)
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
        const deduplicatedOrders = Array.from(uniqueOrderMap.values());
        console.log('Deduplicated orders count:', deduplicatedOrders.length);

        setOrders(deduplicatedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
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
        'Filtering photo order:',
        order.id,
        'Status:',
        order.status,
        'Tab:',
        activeTab,
        'isCartItem:', 
        order.isCartItem
      );

      let shouldShow = false;
      if (activeTab === 'current')
        shouldShow = status === 'pending' || status === 'confirmed' || status === 'in cart' || order.isCartItem === true;
      if (activeTab === 'previous') shouldShow = status === 'completed';
      if (activeTab === 'canceled')
        shouldShow = status === 'cancelled' || status === 'canceled';
      if (activeTab === 'all') shouldShow = true;

      console.log('Should show photography order?', shouldShow);
      return shouldShow;
    }

    // For regular orders, use the existing logic
    const shouldShow = 
      (activeTab === 'current' && (
        order.status === 'pending' ||
        order.status === 'under-review' ||
        order.status === 'confirmed' ||
        order.status === 'shipped' ||
        order.status === 'In Cart' ||
        order.isCartItem === true
      )) ||
      (activeTab === 'previous' && (
        order.status === 'done' ||
        order.status === 'delivered' ||
        order.status === 'returned' ||
        order.isPaid
      )) ||
      (activeTab === 'canceled' && (
        order.status === 'canceled' || 
        order.status === 'cancelled'
      )) ||
      activeTab === 'all';
    
    console.log(
      'Filtering dress order:',
      order.id,
      'Name:', order.name,
      'Status:', order.status,
      'Tab:', activeTab,
      'isCartItem:', order.isCartItem,
      'Should show?', shouldShow
    );
    
    return shouldShow;
  });

  console.log('Final filtered orders count:', filteredOrders.length);
  console.log('Current tab orders types breakdown:');
  console.log('- Regular orders:', filteredOrders.filter(o => !o.isPhotographyService && !o.isCartItem).length);
  console.log('- Photography services:', filteredOrders.filter(o => o.isPhotographyService && !o.isCartItem).length);
  console.log('- Photography cart items:', filteredOrders.filter(o => o.isPhotographyService && o.isCartItem).length);
  console.log('- Dress cart items:', filteredOrders.filter(o => !o.isPhotographyService && o.isCartItem).length);

  // Handle deleting cart items
  const handleDeleteOrder = async (orderId: string) => {
    try {
      console.log('Handling delete for order ID:', orderId);
      setLoading(true);
      
      // Check if this is a photography cart item
      if (orderId.startsWith('photography-cart-item-')) {
        // Extract the serviceId from the photography-cart-item-X pattern
        const serviceId = orderId.replace('photography-cart-item-', '');
        console.log('Deleting photography cart item with serviceId:', serviceId);
        
        // For photography cart items, use removePhotographyFromCart
        const { removePhotographyFromCart } = await import('../../api/photographyCart');
        await removePhotographyFromCart(serviceId);
        
        // Show success message
        toast.success('Photography service removed from cart successfully');
        
        // Refresh orders by removing the deleted one
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      } 
      // Check if this is a dress cart item
      else if (orderId.startsWith('dress-cart-item-')) {
        // Extract the item index from the ID
        const idParts = orderId.split('-');
        const itemIndex = parseInt(idParts[idParts.length - 1]);
        
        console.log('Attempting to delete dress cart item at index:', itemIndex);
        console.log('ID parts:', idParts);
        
        if (!isNaN(itemIndex)) {
          console.log('Using removeFromCart with index:', itemIndex);
          // For dress cart items, use removeFromCart
          await removeFromCart(itemIndex);
          
          // Show success message
          toast.success('Dress removed from cart successfully');
          
          // Refresh orders by removing the deleted one
          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } else {
          console.error('Invalid item index:', itemIndex, 'from ID:', orderId);
          toast.error('Invalid item index');
        }
      } else {
        console.log('Unknown order ID format:', orderId);
      }
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      console.error('Error details:', err instanceof Error ? err.message : String(err));
      toast.error(err.message || 'Failed to delete item');
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
              activeTab="order-history"
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
}
