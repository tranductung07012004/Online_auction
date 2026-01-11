import apiClient from "./apiClient";

export interface ChatMessage {
  id: number;
  orderId: number;
  senderId: number;
  message: string;
  createdAt: string;
}

export interface ChatMessageDTO {
  orderId: number;
  message: string;
}

export interface ChatConversation {
  orderId: number;
  productName: string;
  productThumbnail: string;
  otherUserId: number;
  otherUserName: string;
  orderStatus: string;
}

// Lấy lịch sử chat của order
export const getChatHistory = async (
  orderId: number
): Promise<ChatMessage[]> => {
  const response = await apiClient.get(
    `/api/main/chat/order/${orderId}/messages`
  );
  return response.data;
};

// Kiểm tra quyền truy cập chat
export const checkChatAccess = async (
  orderId: number,
  userId: number
): Promise<boolean> => {
  const response = await apiClient.get(
    `/api/main/chat/order/${orderId}/check-access/${userId}`
  );
  return response.data;
};

// Lấy danh sách tất cả conversations của user
export const getAllConversations = async (): Promise<ChatConversation[]> => {
  try {
    // Try backend endpoint first
    try {
      console.log("Calling backend API: /api/main/chat/conversations");
      const response = await apiClient.get("/api/main/chat/conversations");
      console.log("Backend API response:", response.data);
      return response.data;
    } catch (backendError) {
      // If backend doesn't have this endpoint yet, use fallback
      console.error("Backend endpoint error:", backendError);
      console.log("Using fallback method to get conversations from orders");
      const { getConversationsFromOrders } = await import(
        "./conversationService"
      );
      return await getConversationsFromOrders();
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};
