import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

interface ChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const REACTION_EMOJIS = ['🔥', '🎉', '😍', '💎', '⚡', '👏'];

export default function Chat({ isOpen, onToggle }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, isConnected, onlineUsers, sendMessage, sendReaction } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    if (sendMessage(newMessage)) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-blue-400 italic';
      case 'opening':
        return 'text-orange-400 font-medium';
      case 'reaction':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const handleReaction = (emoji: string, messageId: string) => {
    sendReaction(emoji, messageId);
    setShowReactions(null);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 cases-button text-white shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-5 h-5" />
        {messages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 cases-chat rounded-lg shadow-2xl flex flex-col z-50">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Live Chat</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            <span>{onlineUsers.length}</span>
          </div>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 chat-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="chat-message group relative"
            onMouseEnter={() => user && msg.type !== 'system' && setShowReactions(msg.id)}
            onMouseLeave={() => setShowReactions(null)}
          >
            <div className="flex items-start gap-2 text-sm">
              <span className="text-xs text-gray-500 min-w-[3rem]">
                {formatTime(msg.timestamp)}
              </span>
              <div className="flex-1">
                <span className="font-medium text-orange-400">
                  {msg.username}:
                </span>
                <span className={`ml-1 ${getMessageStyle(msg.type)}`}>
                  {msg.message}
                  {msg.type === 'opening' && msg.data && (
                    <span className="ml-1 text-xs bg-orange-500/20 px-1 rounded">
                      {msg.data.rarity}
                    </span>
                  )}
                </span>
                
                {/* Reaction Emojis */}
                {showReactions === msg.id && user && msg.type !== 'system' && (
                  <div className="absolute right-0 top-0 flex gap-1 bg-gray-800 rounded-md p-1 shadow-lg z-10">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji, msg.id)}
                        className="hover:bg-gray-700 rounded px-1 transition-colors text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-3 py-1 text-xs text-yellow-400 bg-yellow-400/10 border-y border-yellow-400/20">
          <Zap className="w-3 h-3 inline mr-1" />
          Reconnecting to chat...
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-600">
        {user ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="cases-input text-sm"
              maxLength={200}
              disabled={!isConnected}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="cases-button px-3"
              disabled={!newMessage.trim() || !isConnected}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            Sign in to chat
          </div>
        )}
      </div>
    </div>
  );
}