import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const Success = () => {
  useEffect(() => {
    // Confetti effect
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'all 3s ease-out';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.style.top = window.innerHeight + 'px';
          confetti.style.opacity = '0';
          confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
        }, 10);
        
        setTimeout(() => confetti.remove(), 3000);
      }, i * 30);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative mx-auto w-32 h-32">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
            />
            <div className="relative h-32 w-32 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-3xl font-bold mb-2">Account Created! 🎉</h3>
          <p className="text-muted-foreground">आपका खाता बन गया है</p>
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3 
            }}
            className="absolute"
            style={{
              top: `${30 + Math.random() * 40}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
          >
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Success;
