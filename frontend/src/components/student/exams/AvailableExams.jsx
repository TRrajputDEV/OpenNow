import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, searchQuery, filterStatus]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await ExamService.getAllExams();
      const examsData = response.data?.exams || response.data || [];
      
      // Filter only published exams for students
      const publishedExams = examsData.filter((exam) => exam.isPublished);
      setExams(Array.isArray(publishedExams) ? publishedExams : []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch exams',
      });
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = [...exams];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    const now = new Date();
    if (filterStatus === 'active') {
      filtered = filtered.filter(
        (e) => new Date(e.startTime) <= now && new Date(e.endTime) >= now
      );
    } else if (filterStatus === 'upcoming') {
      filtered = filtered.filter((e) => new Date(e.startTime) > now);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter((e) => new Date(e.endTime) < now);
    }

    setFilteredExams(filtered);
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      return {
        label: 'Upcoming',
        color: 'bg-blue-500/10 text-blue-600',
        icon: Calendar,
      };
    }

    if (now > endTime) {
      return {
        label: 'Completed',
        color: 'bg-gray-500/10 text-gray-600',
        icon: CheckCircle2,
      };
    }

    return {
      label: 'Active',
      color: 'bg-green-500/10 text-green-600',
      icon: PlayCircle,
    };
  };

  const canStartExam = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    return now >= startTime && now <= endTime;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Available Exams</h1>
        <p className="text-muted-foreground mt-1">
          Browse and attempt published exams
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Exams</option>
            <option value="active">Active Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Available</p>
          <p className="text-2xl font-bold mt-1">{exams.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Now</p>
          <p className="text-2xl font-bold mt-1">
            {
              exams.filter(
                (e) =>
                  new Date(e.startTime) <= new Date() &&
                  new Date(e.endTime) >= new Date()
              ).length
            }
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold mt-1">
            {exams.filter((e) => new Date(e.startTime) > new Date()).length}
          </p>
        </Card>
      </div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams found</h3>
            <p className="text-muted-foreground">
              {exams.length === 0
                ? 'No exams are available at the moment'
                : 'Try adjusting your filters'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam, index) => {
            const status = getExamStatus(exam);
            const canStart = canStartExam(exam);
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {exam.subject}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ml-2 flex items-center gap-1 ${status.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>

                  {/* Description */}
                  {exam.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {exam.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">
                        {formatDate(exam.startTime)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    {canStart ? (
                      <Button asChild className="w-full">
                        <Link to={`/student/exams/${exam._id}/start`}>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Exam
                        </Link>
                      </Button>
                    ) : new Date(exam.startTime) > new Date() ? (
                      <Button disabled className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Starts {formatDate(exam.startTime)}
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Exam Ended
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
