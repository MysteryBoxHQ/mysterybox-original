import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'opening' | 'system' | 'reaction';
  data?: any; // For opening announcements and reactions
}

export interface ChatReaction {
  emoji: string;
  messageId: string;
  username: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const connect = useCallback(() => {
    // Temporarily disable chat to fix spinning animation
    return;
  }, [user]);

  useEffect(() => {
    // Disabled for now
  }, [connect]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: string) => {
    // Disabled for now
  }, [isConnected, user]);

  const sendOpeningAnnouncement = useCallback((item: any, box: any) => {
    // Disabled for now
  }, [isConnected, user]);

  const sendReaction = useCallback((emoji: string, messageId: string) => {
    // Disabled for now
  }, [isConnected, user]);

  return {
    messages,
    isConnected,
    onlineUsers,
    sendMessage,
    sendOpeningAnnouncement,
    sendReaction,
    connect,
    disconnect
  };
}