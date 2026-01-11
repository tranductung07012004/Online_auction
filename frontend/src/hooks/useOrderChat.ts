import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ChatMessage, ChatMessageDTO, getChatHistory } from "../api/chat";
import { useAuthStore } from "../stores/authStore";

interface UseOrderChatProps {
  orderId: number;
}

interface UseOrderChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

export const useOrderChat = ({
  orderId,
}: UseOrderChatProps): UseOrderChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stompClientRef = useRef<Client | null>(null);
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const history = await getChatHistory(orderId);
        setMessages(history);
        setError(null);
      } catch (err) {
        console.error("Error loading chat history:", err);
        setError("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadChatHistory();
    }
  }, [orderId]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!orderId || !userId || !role) {
      console.log("Missing required params:", { orderId, userId, role });
      return;
    }

    console.log("Connecting to WebSocket with:", { orderId, userId, role });

    // Create SockJS connection - Connect directly to main service (port 8082)
    const socket = new SockJS("http://localhost:8082/ws-chat");

    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        "X-user-id": String(userId),
        "X-user-role": role,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // On connect
    client.onConnect = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      setError(null);

      // Subscribe to chat messages for this order
      client.subscribe(`/topic/chat/${orderId}`, (message) => {
        try {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          console.log("Received message:", receivedMessage);

          setMessages((prevMessages) => {
            // Avoid duplicates
            const exists = prevMessages.some(
              (msg) => msg.id === receivedMessage.id
            );
            if (exists) return prevMessages;
            return [...prevMessages, receivedMessage];
          });
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      });
    };

    // On error
    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setError("Connection error");
      setIsConnected(false);
    };

    // On disconnect
    client.onDisconnect = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    };

    // Activate the client
    client.activate();
    stompClientRef.current = client;

    // Cleanup on unmount
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [orderId, userId, role]);

  // Send message function
  const sendMessage = useCallback(
    (message: string) => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.error("WebSocket not connected");
        setError("Not connected to chat server");
        return;
      }

      if (!message.trim()) return;

      const messageDTO: ChatMessageDTO = {
        orderId,
        message: message.trim(),
      };

      try {
        stompClientRef.current.publish({
          destination: "/app/chat/send",
          body: JSON.stringify(messageDTO),
        });
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    },
    [orderId]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    loading,
    error,
  };
};
