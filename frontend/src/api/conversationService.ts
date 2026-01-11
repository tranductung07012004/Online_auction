import { getAllOrders } from "./order";
import { ChatConversation } from "./chat";

/**
 * Helper service to get chat conversations from orders
 * This is a fallback solution when backend /api/main/chat/conversations is not available
 */

export const getConversationsFromOrders = async (): Promise<
  ChatConversation[]
> => {
  try {
    // Get all orders for current user
    const orders = await getAllOrders(0, 100); // Get more orders

    if (!orders || orders.length === 0) {
      return [];
    }

    // Map orders to conversations
    const conversations: ChatConversation[] = orders.map((order: any) => {
      // Determine other user (if current user is buyer, other is seller and vice versa)
      const currentUserId = Number(localStorage.getItem("userId"));
      const isBuyer = order.buyerId === currentUserId;
      const otherUserId = isBuyer ? order.sellerId : order.buyerId;
      const otherUserName = isBuyer ? "Người bán" : "Người mua";

      return {
        orderId: order.id,
        productName: order.product?.productName || "Unknown Product",
        productThumbnail: order.product?.thumbnailUrl || "/placeholder.svg",
        otherUserId: otherUserId,
        otherUserName: otherUserName,
        orderStatus: order.status || "CREATED",
      };
    });

    return conversations;
  } catch (error) {
    console.error("Error getting conversations from orders:", error);
    throw error;
  }
};
