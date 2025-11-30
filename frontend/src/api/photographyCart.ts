import { toast } from 'react-hot-toast';

// Photography service cart item type
export interface PhotographyCartItem {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  price: number;
  imageUrl: string;
  bookingDate: string;
  location: string;
}

// Local storage key for photography cart
const PHOTOGRAPHY_CART_KEY = 'photography_cart_items';

// Get photography cart items from local storage
export const getPhotographyCart = (): PhotographyCartItem[] => {
  try {
    const cartItems = localStorage.getItem(PHOTOGRAPHY_CART_KEY);
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error('Error getting photography cart:', error);
    return [];
  }
};

// Add photography service to cart (store in local storage)
export const addPhotographyToCart = async (item: PhotographyCartItem): Promise<void> => {
  try {
    // Get current cart items from localStorage
    const cartItemsJson = localStorage.getItem(PHOTOGRAPHY_CART_KEY);
    let cartItems: PhotographyCartItem[] = [];
    
    if (cartItemsJson) {
      cartItems = JSON.parse(cartItemsJson);
    }
    
    // Format the booking date to include time
    const bookingDate = new Date(item.bookingDate);
    const formattedDate = bookingDate.toISOString();
    
    // Update the item with formatted date
    const updatedItem = {
      ...item,
      bookingDate: formattedDate
    };
    
    // Check if item already exists in cart (based on serviceId)
    const existingItemIndex = cartItems.findIndex(cartItem => 
      cartItem.serviceId === updatedItem.serviceId
    );
    
    if (existingItemIndex >= 0) {
      // Replace existing item
      cartItems[existingItemIndex] = updatedItem;
    } else {
      // Add new item
      cartItems.push(updatedItem);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem(PHOTOGRAPHY_CART_KEY, JSON.stringify(cartItems));
    
    // Also update current order if it exists
    const currentOrderJson = localStorage.getItem('currentOrder');
    if (currentOrderJson) {
      const currentOrder = JSON.parse(currentOrderJson);
      
      // Convert photography items to expected structure
      const photographyItems = cartItems.map(item => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        serviceType: item.serviceType,
        price: item.price,
        imageUrl: item.imageUrl,
        bookingDate: item.bookingDate,
        location: item.location
      }));
      
      // Update order with photography items
      const updatedOrder = {
        ...currentOrder,
        photographyItems: photographyItems
      };
      
      localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
    }
    
    console.log('Photography item added to cart and updated in orders:', updatedItem);
  } catch (error) {
    console.error('Error adding photography item to cart:', error);
    throw error;
  }
};

// Remove photography service from cart
export const removePhotographyFromCart = (serviceId: string): void => {
  try {
    const cartItemsJson = localStorage.getItem(PHOTOGRAPHY_CART_KEY);
    if (!cartItemsJson) return;
    
    let cartItems: PhotographyCartItem[] = JSON.parse(cartItemsJson);
    cartItems = cartItems.filter(item => item.serviceId !== serviceId);
    
    localStorage.setItem(PHOTOGRAPHY_CART_KEY, JSON.stringify(cartItems));
    
    // Also update current order if it exists
    const currentOrderJson = localStorage.getItem('currentOrder');
    if (currentOrderJson) {
      const currentOrder = JSON.parse(currentOrderJson);
      
      if (currentOrder.photographyItems) {
        // Remove the item from photography items
        const updatedPhotographyItems = currentOrder.photographyItems.filter(
          (item: any) => item.serviceId !== serviceId
        );
        
        // Update order
        const updatedOrder = {
          ...currentOrder,
          photographyItems: updatedPhotographyItems
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
      }
    }
  } catch (error) {
    console.error('Error removing photography item from cart:', error);
  }
};

// Clear photography cart
export const clearPhotographyCart = (): void => {
  localStorage.removeItem(PHOTOGRAPHY_CART_KEY);
  
  // Also update current order if it exists
  const currentOrderJson = localStorage.getItem('currentOrder');
  if (currentOrderJson) {
    const currentOrder = JSON.parse(currentOrderJson);
    
    // Remove photography items from order
    const updatedOrder = {
      ...currentOrder,
      photographyItems: []
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
  }
};

// Update photography booking date
export const updatePhotographyBookingDate = (serviceId: string, bookingDate: string): PhotographyCartItem[] => {
  try {
    // Get current cart
    const currentCart = getPhotographyCart();
    
    // Find the item to update
    const itemIndex = currentCart.findIndex(item => item.serviceId === serviceId);
    
    if (itemIndex >= 0) {
      // Update booking date
      currentCart[itemIndex].bookingDate = bookingDate;
      
      // Save to local storage
      localStorage.setItem(PHOTOGRAPHY_CART_KEY, JSON.stringify(currentCart));
      
      toast.success('Booking date updated');
    }
    
    return currentCart;
  } catch (error) {
    console.error('Error updating photography booking date:', error);
    toast.error('Failed to update booking date');
    return getPhotographyCart();
  }
};

// Format the booking date for display
export const formatBookingDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format date and time
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${formattedDate} at ${formattedTime}`;
};
