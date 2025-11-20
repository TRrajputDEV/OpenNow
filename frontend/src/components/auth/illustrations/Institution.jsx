import { motion } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';

const Institution = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8"
      >
        <div className="relative mx-auto w-64 h-64">
          {/* University building */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full"
          >
            <div className="relative">
              {/* Main building */}
              <div className="h-40 w-48 mx-auto bg-secondary border-2 border-border rounded-t-lg relative">
                {/* Windows */}
                <div className="grid grid-cols-3 gap-2 p-4">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-6 w-6 bg-background border border-border" />
                  ))}
                </div>
                {/* Door */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-16 bg-foreground" />
              </div>
              {/* Roof */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[120px] border-r-[120px] border-b-[40px] border-l-transparent border-r-transparent border-b-foreground" />
            </div>
          </motion.div>

          {/* Location pin */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 right-8"
          >
            <MapPin className="h-8 w-8 text-red-500" />
          </motion.div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">Your Institution</h3>
          <p className="text-muted-foreground">Where knowledge meets excellence</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Institution;
