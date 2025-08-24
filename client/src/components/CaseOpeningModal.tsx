import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CaseOpeningModalProps {
  isOpen: boolean;
  caseName: string;
  onComplete: () => void;
}

export default function CaseOpeningModal({ isOpen, caseName, onComplete }: CaseOpeningModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(progressInterval);
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="relative w-80 h-80 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-card m-4 rounded-lg h-72 flex items-center justify-center">
                <motion.i
                  className="fas fa-cube text-8xl text-primary"
                  animate={{ 
                    rotateY: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </div>
            
            <motion.h2 
              className="text-3xl font-bold mb-4"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Opening {caseName}...
            </motion.h2>
            
            <div className="w-64 h-3 bg-muted rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
