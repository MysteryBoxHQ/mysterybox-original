import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useClickOutside } from "@/hooks/useClickOutside";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'opening' | 'system' | 'reaction';
  data?: any;
}

interface LiveChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const REACTION_EMOJIS = ['🔥', '🎉', '😍', '💎', '⚡', '👏'];

export default function LiveChat({ isOpen, onToggle }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      username: 'System',
      message: 'Welcome to RollingDrop live chat! Share your amazing openings here.',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [onlineUsers] = useState(['Player_2024', 'CaseHunter', 'LuckMaster', 'BoxOpener']);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) {
      onToggle();
    }
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate live activity
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const openingMessages = [
        { user: 'CaseHunter', item: 'Golden Watch', box: 'Luxury Collection' },
        { user: 'LuckMaster', item: 'Diamond Ring', box: 'Jewelry Box' },
        { user: 'BoxOpener', item: 'Sports Car', box: 'Vehicle Crate' },
        { user: 'Player_2024', item: 'Rare Gemstone', box: 'Treasure Chest' }
      ];

      const randomOpening = openingMessages[Math.floor(Math.random() * openingMessages.length)];
      
      if (Math.random() < 0.3) { // 30% chance every 15 seconds
        const newMsg: ChatMessage = {
          id: `opening_${Date.now()}`,
          username: randomOpening.user,
          message: `opened ${randomOpening.item} from ${randomOpening.box}!`,
          timestamp: new Date(),
          type: 'opening',
          data: { itemName: randomOpening.item, boxName: randomOpening.box }
        };
        
        setMessages(prev => [...prev.slice(-49), newMsg]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      username: user.username,
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev.slice(-49), message]);
    setNewMessage('');
    
    toast({
      title: "Message Sent",
      description: "Your message has been posted to chat",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleReaction = (emoji: string, messageId: string) => {
    if (!user) return;
    
    const reactionMsg: ChatMessage = {
      id: `reaction_${Date.now()}`,
      username: user.username,
      message: `reacted ${emoji}`,
      timestamp: new Date(),
      type: 'reaction',
      data: { emoji, messageId }
    };
    
    setMessages(prev => [...prev.slice(-49), reactionMsg]);
    setShowReactions(null);
  };

  const announceOpening = (itemName: string, rarity: string, boxName: string) => {
    if (!user) return;
    
    const openingMsg: ChatMessage = {
      id: `opening_${Date.now()}`,
      username: user.username,
      message: `opened ${itemName} from ${boxName}!`,
      timestamp: new Date(),
      type: 'opening',
      data: { itemName, rarity, boxName }
    };
    
    setMessages(prev => [...prev.slice(-49), openingMsg]);
  };

  // Expose the announceOpening function globally for other components
  useEffect(() => {
    (window as any).announceOpening = announceOpening;
    return () => {
      delete (window as any).announceOpening;
    };
  }, [user]);

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

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 cases-button text-white shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-5 h-5" />
        {messages.length > 1 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 cases-chat rounded-lg shadow-2xl flex flex-col z-50" ref={chatRef}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Live Chat</h3>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
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
                      {msg.data.rarity || 'rare'}
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
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="cases-button px-3"
              disabled={!newMessage.trim()}
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