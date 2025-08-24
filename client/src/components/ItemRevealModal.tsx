import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getRarityClass, RARITY_LABELS } from "@/lib/utils";
import type { Item } from "@shared/schema";

interface ItemRevealModalProps {
  isOpen: boolean;
  item: Item | null;
  onClose: () => void;
  onOpenAnother: () => void;
}

export default function ItemRevealModal({ isOpen, item, onClose, onOpenAnother }: ItemRevealModalProps) {
  if (!item) return null;

  const rarityColorClass = getRarityClass(item.rarity);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-64 h-64 mx-auto mb-6">
              <motion.div
                className={`absolute inset-0 ${rarityColorClass} rounded-xl`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-card m-4 rounded-lg h-56 flex items-center justify-center overflow-hidden">
                <motion.img
                  src={item.icon}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    delay: 0.3,
                    duration: 0.8
                  }}
                />
              </div>
            </div>
            
            <motion.h2 
              className="text-4xl font-bold mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {item.name}
            </motion.h2>
            
            <motion.div 
              className="mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className={`px-4 py-2 rounded-full ${rarityColorClass} text-lg font-semibold`}>
                {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS]}
              </span>
            </motion.div>
            
            <motion.p 
              className="text-muted-foreground mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {item.description}
            </motion.p>
            
            <motion.div 
              className="flex space-x-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                Add to Inventory
              </Button>
              <Button onClick={onOpenAnother} variant="secondary">
                Open Another
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
