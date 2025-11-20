import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Shield } from 'lucide-react';

const RoleSelection = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold">Choose Your Path</h2>
        <p className="text-muted-foreground">अपनी भूमिका चुनें</p>
      </motion.div>

      <div className="flex gap-8">
        {[
          { icon: GraduationCap, label: 'Student', delay: 0 },
          { icon: BookOpen, label: 'Teacher', delay: 0.2 },
          { icon: Shield, label: 'Admin', delay: 0.4 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: item.delay }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: item.delay }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-24 w-24 rounded-2xl bg-secondary border-2 border-border flex items-center justify-center">
                <item.icon className="h-12 w-12" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gray-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gray-200/10 rounded-full blur-3xl" />
    </div>
  );
};

export default RoleSelection;
