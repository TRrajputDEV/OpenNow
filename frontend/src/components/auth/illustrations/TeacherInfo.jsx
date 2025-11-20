import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

const TeacherInfo = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-full" />
          <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
            <Users className="h-24 w-24 text-foreground" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">Teacher Profile</h3>
          <p className="text-muted-foreground">Shape the future of education</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherInfo;
