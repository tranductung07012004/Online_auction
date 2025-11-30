import {
  CheckCircle,
  XCircle,
  Clock,
  Hourglass,
  Trash2,
  Package2,
} from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

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
  purchaseType?: 'rent' | 'buy' | 'service'; // Thêm 'service' cho dịch vụ nhiếp ảnh
  isPhotographyService?: boolean; // Flag để nhận biết đây là dịch vụ nhiếp ảnh
  additionalDetails?: string;
}

interface OrderCardProps {
  order: OrderItem;
  onDelete?: (orderId: string) => Promise<void>;
}

export function OrderCard({ order, onDelete }: OrderCardProps): JSX.Element {
  const getStatusIcon = () => {
    // For cart items, use a shopping cart icon
    if (order.isCartItem) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-blue-500"
        >
          <circle cx="8" cy="21" r="1"></circle>
          <circle cx="19" cy="21" r="1"></circle>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
        </svg>
      );
    }

    // Special handling for photography bookings with original backend status names
    if (order.isPhotographyService) {
      switch (order.status) {
        case 'Completed':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'Confirmed':
          return <Hourglass className="h-5 w-5 text-amber-500" />;
        case 'Pending':
          return <Clock className="h-5 w-5 text-amber-500" />;
        case 'Cancelled':
          return <XCircle className="h-5 w-5 text-red-500" />;
        default:
          return null;
      }
    }

    // Existing logic for regular orders
    switch (order.status) {
      case 'done':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'confirmed':
        return <Package2 className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Package2 className="h-5 w-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'returned':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'under-review':
        return <Hourglass className="h-5 w-5 text-amber-500" />;
      case 'canceled':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (order.isPaid) {
      return 'Paid';
    }

    // Check for cart items first
    if (order.isCartItem || order.status === 'In Cart') {
      return 'In Cart';
    }

    // Special handling for photography bookings
    if (order.isPhotographyService) {
      return order.status; // Just return the original status
    }

    switch (order.status) {
      case 'done':
        return 'Done';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'returned':
        return 'Returned';
      case 'pending':
        return 'Pending';
      case 'under-review':
        return 'Under Review';
      case 'canceled':
      case 'cancelled':
        return 'Canceled';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    // For cart items, use a distinctive color
    if (order.isCartItem) {
      return 'text-blue-500';
    }

    // Special handling for photography bookings
    if (order.isPhotographyService) {
      switch (order.status) {
        case 'Completed':
          return 'text-green-600';
        case 'Cancelled':
          return 'text-red-500';
        default:
          return 'text-amber-500';
      }
    }

    // Existing logic for regular orders
    switch (order.status) {
      case 'done':
      case 'confirmed':
        return 'text-green-600';
      case 'canceled':
        return 'text-red-500';
      default:
        return 'text-amber-500';
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (onDelete) {
        await onDelete(order.id);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <img
            src={order.image || '/placeholder.svg'}
            alt={order.name}
            width={80}
            height={120}
            className="rounded-md object-cover"
          />
        </div>

        <div className="flex-grow">
          <h3 className="font-medium text-lg">{order.name}</h3>
          <p className="text-gray-600 text-sm">
            {order.isPhotographyService ? (
              <>Dịch vụ nhiếp ảnh / {order.size}</>
            ) : (
              <>
                {order.size} / {order.color}
                {order.purchaseType !== 'buy' &&
                  order.purchaseType !== 'service' &&
                  ` / ${order.rentalDuration}`}
                {order.purchaseType === 'buy' && ` / Mua sản phẩm`}
              </>
            )}
          </p>
          <div className="mt-1 text-sm text-gray-600">
            {order.isPhotographyService ? (
              <p>Ngày chụp: {order.arrivalDate}</p>
            ) : order.purchaseType === 'buy' ? (
              <p>Ngày giao hàng: {order.arrivalDate}</p>
            ) : (
              <>
                <p>Arrives by {order.arrivalDate}</p>
                <p>Returns by {order.returnDate}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-3">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className={`ml-1 ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="flex space-x-2">
            {(order.status === 'pending' ||
              order.status === 'under-review') &&
              onDelete && !order.isCartItem && !order.isPhotographyService && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-1 border rounded-full text-sm text-red-600 hover:bg-red-50 border-red-200 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </button>
              )}

            {(order.isCartItem || order.status === 'In Cart') && (
              <Link 
                to="/cart" 
                className="px-4 py-1 border rounded-full text-sm text-blue-600 hover:bg-blue-50 border-blue-200 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-1"
                >
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                Go to Cart
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
