import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Calendar,
  TrendingUp,
  Download,
  Share2,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempt();
  }, [id]);

// Around line 50-60, update fetchAttempt:
const fetchAttempt = async () => {
  try {
    setLoading(true);
    const response = await ExamService.getAttemptById(id);
    const attemptData = response.data;
    
    // Validate data
    if (!attemptData || !attemptData.exam) {
      throw new Error('Invalid attempt data');
    }
    
    setAttempt(attemptData);

    // Celebrate if passed!
    if (attemptData.status === 'passed') {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    }
  } catch (error) {
    console.error('Error fetching attempt:', error);
    
    // Mock data for testing
    const mockAttempt = {
      _id: id,
      exam: {
        title: 'Sample Exam',
        subject: 'Sample Subject',
        totalMarks: 100,
        passingMarks: 40,
        questions: [],
      },
      score: 85,
      status: 'passed',
      correctAnswers: 17,
      incorrectAnswers: 3,
      timeTaken: 1800,
      completedAt: new Date().toISOString(),
      answers: [],
    };
    
    setAttempt(mockAttempt);
    
    // Uncomment when backend is ready
    // toast({
    //   variant: 'destructive',
    //   title: 'Error',
    //   description: error.message || 'Failed to fetch result',
    // });
    // navigate('/student/results');
  } finally {
    setLoading(false);
  }
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!attempt) return null;

  const percentage = ((attempt.score / attempt.exam.totalMarks) * 100).toFixed(2);
  const isPassed = attempt.status === 'passed';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student/results')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>
      </div>

      {/* Result Card */}
      <Card
        className={`p-8 text-center ${
          isPassed
            ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200'
            : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200'
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <div
            className={`h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isPassed ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isPassed ? (
              <CheckCircle2 className="h-10 w-10 text-white" />
            ) : (
              <XCircle className="h-10 w-10 text-white" />
            )}
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">
          {isPassed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isPassed
            ? 'You have successfully passed the exam'
            : 'You need to score more to pass this exam'}
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div>
            <p className="text-4xl font-bold mb-1">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Percentage</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-1">
              {attempt.score}/{attempt.exam.totalMarks}
            </p>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-1">
              {attempt.correctAnswers}/{attempt.exam.questions.length}
            </p>
            <p className="text-sm text-muted-foreground">Correct Answers</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-2xl font-bold text-green-600">
                {attempt.correctAnswers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="text-2xl font-bold text-red-600">
                {attempt.incorrectAnswers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Taken</p>
              <p className="text-2xl font-bold">{formatTime(attempt.timeTaken)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passing</p>
              <p className="text-2xl font-bold">{attempt.exam.passingMarks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exam Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Exam Title</p>
            <p className="font-medium">{attempt.exam.title}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Subject</p>
            <p className="font-medium">{attempt.exam.subject}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Attempted On</p>
            <p className="font-medium">{formatDate(attempt.completedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Status</p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isPassed
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-red-500/10 text-red-600'
              }`}
            >
              {isPassed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {attempt.status.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Questions Review */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Question-wise Analysis</h2>

        <div className="space-y-4">
          {attempt.answers.map((answer, index) => {
            const question = attempt.exam.questions.find(
              (q) => q.question._id === answer.questionId
            )?.question;
            
            if (!question) return null;

            const isCorrect = answer.isCorrect;
            const userAnswer = Array.isArray(answer.answer)
              ? answer.answer
              : [answer.answer];
            const correctAnswer = Array.isArray(question.correctAnswer)
              ? question.correctAnswer
              : [question.correctAnswer];

            return (
              <motion.div
                key={answer.questionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-200 bg-green-500/5'
                    : 'border-red-200 bg-red-500/5'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{question.questionText}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-1 rounded bg-secondary">
                        {question.type}
                      </span>
                      <span className="text-muted-foreground">
                        {answer.marks} {answer.marks === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>

                {/* Answers */}
                <div className="ml-11 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Your Answer:</p>
                    <div
                      className={`p-2 rounded ${
                        isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {userAnswer.filter(Boolean).length > 0
                          ? userAnswer.filter(Boolean).join(', ')
                          : 'Not Answered'}
                      </p>
                    </div>
                  </div>

                  {!isCorrect && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Correct Answer:
                      </p>
                      <div className="p-2 rounded bg-green-100">
                        <p className="text-sm font-medium text-green-700">
                          {correctAnswer.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/student/exams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse More Exams
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Result
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ResultDetail;
