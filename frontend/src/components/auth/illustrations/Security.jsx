import { motion } from 'framer-motion';
import { Lock, Shield, Check } from 'lucide-react';

const Security = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8"
      >
        <div className="relative mx-auto w-48 h-48">
          {/* Shield */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Shield className="h-48 w-48 text-foreground/10" />
          </motion.div>

          {/* Lock */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Lock className="h-24 w-24 text-foreground" />
          </motion.div>

          {/* Check marks */}
          {[0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.2 }}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-80px)`,
              }}
            >
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">Secure Your Account</h3>
          <p className="text-muted-foreground">Create a strong password</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Security;
