import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ExamsList = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
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
      setExams(Array.isArray(examsData) ? examsData : []);
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
    if (filterStatus === 'published') {
      filtered = filtered.filter((e) => e.isPublished);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter((e) => !e.isPublished);
    }

    setFilteredExams(filtered);
  };

  const handleDelete = async () => {
    try {
      await ExamService.deleteExam(examToDelete);
      toast({
        title: 'Success',
        description: 'Exam deleted successfully',
      });
      fetchExams();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete exam',
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exams</h1>
          <p className="text-muted-foreground mt-1">Manage your exams</p>
        </div>
        <Button asChild>
          <Link to="/teacher/exams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
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
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Exams</p>
          <p className="text-2xl font-bold mt-1">{exams.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold mt-1">
            {exams.filter((e) => e.isPublished).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold mt-1">
            {exams.filter((e) => !e.isPublished).length}
          </p>
        </Card>
      </div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams found</h3>
            <p className="text-muted-foreground mb-6">
              {exams.length === 0
                ? 'Start creating exams from your question bank'
                : 'Try adjusting your filters'}
            </p>
            {exams.length === 0 && (
              <Button asChild>
                <Link to="/teacher/exams/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Exam
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam, index) => (
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
                    <p className="text-sm text-muted-foreground">{exam.subject}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                      exam.isPublished
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-orange-500/10 text-orange-600'
                    }`}
                  >
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

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
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{exam.totalMarks} marks</span>
                  </div>
                  {exam.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(exam.scheduledDate)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/teacher/exams/${exam._id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Link to={`/teacher/exams/edit/${exam._id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setExamToDelete(exam._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam
              and all associated attempts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamsList;
