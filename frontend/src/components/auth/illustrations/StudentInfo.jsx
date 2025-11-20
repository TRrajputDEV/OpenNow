import { motion } from 'framer-motion';
import { BookOpen, Users, Award } from 'lucide-react';

const StudentInfo = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-48 h-48">
            {/* Student illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full" />
            <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-foreground" />
            </div>
            {/* Floating icons */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Award className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-500" />
              <Users className="absolute bottom-0 left-1/2 -translate-x-1/2 h-6 w-6 text-blue-500" />
            </motion.div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">Student Information</h3>
            <p className="text-muted-foreground">Let's get to know you better</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentInfo;
