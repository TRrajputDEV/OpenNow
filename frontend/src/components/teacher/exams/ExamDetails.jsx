import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Settings,
  BarChart3,
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

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await ExamService.getExamById(id);
      setExam(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch exam',
      });
      navigate('/teacher/exams');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await ExamService.publishExam(id);
      toast({
        title: 'Success',
        description: 'Exam published successfully',
      });
      fetchExam();
      setPublishDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to publish exam',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setActionLoading(true);
    try {
      await ExamService.unpublishExam(id);
      toast({
        title: 'Success',
        description: 'Exam unpublished successfully',
      });
      fetchExam();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to unpublish exam',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await ExamService.deleteExam(id);
      toast({
        title: 'Success',
        description: 'Exam deleted successfully',
      });
      navigate('/teacher/exams');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete exam',
      });
      setActionLoading(false);
    }
  };

  const getStatusBadge = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (!exam.isPublished) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Draft
        </span>
      );
    }

    if (now < startTime) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Scheduled
        </span>
      );
    }

    if (now > endTime) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
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

  if (!exam) return null;

  const canEdit = !exam.isPublished || new Date() < new Date(exam.startTime);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/teacher/exams')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{exam.title}</h1>
              {getStatusBadge(exam)}
            </div>
            <p className="text-muted-foreground">{exam.description || 'No description'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {exam.isPublished ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={actionLoading || new Date() >= new Date(exam.startTime)}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish
            </Button>
          ) : (
            <Button onClick={() => setPublishDialogOpen(true)} disabled={actionLoading}>
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}

          {canEdit && (
            <Button variant="outline" asChild>
              <Link to={`/teacher/exams/edit/${exam._id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={actionLoading || (exam.isPublished && new Date() >= new Date(exam.startTime))}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Warning for draft exams */}
      {!exam.isPublished && (
        <Card className="p-4 bg-orange-500/5 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">This exam is in draft mode</p>
              <p className="text-sm text-orange-700 mt-1">
                Students won't be able to see or attempt this exam until you publish it.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Exam Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold">{exam.questions?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold">{exam.duration} min</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Marks</p>
              <p className="text-2xl font-bold">{exam.totalMarks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passing</p>
              <p className="text-2xl font-bold">{exam.passingMarks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exam Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{exam.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{exam.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{exam.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Marks:</span>
              <span className="font-medium">{exam.totalMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passing Marks:</span>
              <span className="font-medium">{exam.passingMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allowed Students:</span>
              <span className="font-medium capitalize">{exam.allowedStudents}</span>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Start Time:</p>
              <p className="font-medium">{formatDate(exam.startTime)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">End Time:</p>
              <p className="font-medium">{formatDate(exam.endTime)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Created:</p>
              <p className="font-medium">{formatDate(exam.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated:</p>
              <p className="font-medium">{formatDate(exam.updatedAt)}</p>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instructions
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {exam.instructions || 'No specific instructions provided.'}
          </p>
        </Card>

        {/* Settings */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Exam Settings
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${exam.settings?.shuffleQuestions ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Shuffle Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${exam.settings?.showResultsImmediately ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${exam.settings?.allowReview ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Allow Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${exam.settings?.partialMarking ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Partial Marking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${exam.settings?.negativeMarking ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Negative Marking</span>
            </div>
            {exam.settings?.negativeMarking && (
              <div className="text-muted-foreground">
                Negative: -{exam.settings.negativeMarkingValue} marks
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Questions List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Questions ({exam.questions?.length || 0})
          </h2>
        </div>

        {exam.questions && exam.questions.length > 0 ? (
          <div className="space-y-3">
            {exam.questions.map((q, index) => (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {q.order || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-2 line-clamp-2">
                      {q.question?.questionText || 'Question text not available'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="px-2 py-1 rounded bg-secondary">
                        {q.question?.type || 'N/A'}
                      </span>
                      <span>Marks: {q.marks}</span>
                      {q.question?.difficulty && (
                        <span className="capitalize">Difficulty: {q.question.difficulty}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No questions added to this exam yet</p>
          </div>
        )}
      </Card>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Once published, students will be able to see and attempt this exam according to the schedule. Make sure all details are correct before publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={actionLoading}>
              {actionLoading ? 'Publishing...' : 'Publish Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Deleting...' : 'Delete Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamDetails;
