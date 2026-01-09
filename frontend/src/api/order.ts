import apiClient from "./apiClient";

// Lấy tất cả order của user hiện tại (buyer hoặc seller)
export const getAllOrders = async (page = 0, size = 10) => {
  const response = await apiClient.get("/api/main/order", {
    params: { page, size },
  });
  return response.data.data.content || response.data.data; // Nếu backend trả về PageResponse
};

// Lấy chi tiết order theo ID
export const getOrderById = async (orderId: string | number) => {
  const response = await apiClient.get(`/api/main/order/${orderId}`);
  return response.data.data; // Trả về OrderWithProductResponse
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await apiClient.put(`/api/main/order/${orderId}/status`, {
    status,
  });
  return response.data.data;
};

// Cập nhật địa chỉ giao hàng
export const updateShippingAddress = async (
  orderId: number,
  shippingAddress: string
) => {
  const response = await apiClient.post(`/api/main/order/${orderId}/shipping`, {
    shippingAddress,
  });
  return response.data.data;
};

// Xác nhận đã nhận tiền và gửi vận đơn (seller)
export const confirmPaymentAndShipping = async (
  orderId: number,
  trackingNumber: string
) => {
  const response = await apiClient.post(
    `/api/main/order/${orderId}/confirm-shipping`,
    {
      trackingNumber,
    }
  );
  return response.data.data;
};

// Xác nhận đã nhận hàng (buyer)
export const confirmDelivery = async (orderId: number) => {
  const response = await apiClient.post(
    `/api/main/order/${orderId}/confirm-delivery`
  );
  return response.data.data;
};

// Đánh giá đơn hàng
export const submitOrderReview = async (
  orderId: number,
  rating: number,
  comment: string
) => {
  const response = await apiClient.post(`/api/main/order/${orderId}/review`, {
    status: rating, // 1 for positive, -1 for negative
    comment,
  });
  return response.data.data;
};

// Hủy đơn hàng (seller)
export const cancelOrder = async (orderId: number, reason: string) => {
  const response = await apiClient.post(`/api/main/order/${orderId}/cancel`, {
    cancelledReason: reason,
  });
  return response.data.data;
};

// Lấy thông tin shipping
export const getOrderShipping = async (orderId: number) => {
  const response = await apiClient.get(`/api/main/order/${orderId}/shipping`);
  return response.data.data;
};

// Lấy thông tin payment
export const getOrderPayment = async (orderId: number) => {
  const response = await apiClient.get(`/api/main/order/${orderId}/payment`);
  return response.data.data;
};

// Upload payment proof (buyer)
export const uploadPaymentProof = async (
  orderId: number,
  paymentProofUrl: string,
  paymentMethod?: string,
  notes?: string
) => {
  const response = await apiClient.post(
    `/api/main/order/${orderId}/payment/upload-proof`,
    {
      paymentProofUrl,
      paymentMethod,
      notes,
    }
  );
  return response.data.data;
};

// Confirm payment received (seller)
export const confirmPaymentReceived = async (
  orderId: number,
  notes?: string
) => {
  const response = await apiClient.post(
    `/api/main/order/${orderId}/payment/confirm`,
    {
      notes,
    }
  );
  return response.data.data;
};

// Lấy reviews của order
export const getOrderReviews = async (orderId: number) => {
  const response = await apiClient.get(`/api/main/order/${orderId}/reviews`);
  return response.data.data;
};

// Lấy chat messages
export const getOrderChatMessages = async (orderId: number) => {
  const response = await apiClient.get(`/api/main/order/${orderId}/chat`);
  return response.data.data;
};

// Gửi chat message
export const sendChatMessage = async (orderId: number, message: string) => {
  const response = await apiClient.post(`/api/main/order/${orderId}/chat`, {
    message,
  });
  return response.data.data;
};
