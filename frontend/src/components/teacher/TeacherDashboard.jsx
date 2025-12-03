import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { QuestionService, ExamService } from '@/services';
import { useAuth } from '@/context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0,
    publishedExams: 0,
    draftExams: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentExams, setRecentExams] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const [questionsRes, examsRes] = await Promise.all([
      QuestionService.getAllQuestions(),
      ExamService.getAllExams(),
    ]);

    // Handle different response structures
    const questions = questionsRes.data?.questions || questionsRes.data || [];
    const exams = examsRes.data?.exams || examsRes.data || [];
    
    console.log('Dashboard data:', { questions, exams }); // Debug log

    setStats({
      totalQuestions: Array.isArray(questions) ? questions.length : 0,
      totalExams: Array.isArray(exams) ? exams.length : 0,
      publishedExams: Array.isArray(exams) ? exams.filter((e) => e.isPublished).length : 0,
      draftExams: Array.isArray(exams) ? exams.filter((e) => !e.isPublished).length : 0,
    });

    setRecentExams(Array.isArray(exams) ? exams.slice(0, 5) : []);
  } catch (error) {
    console.error('Dashboard error:', error); // Debug log
    // Set default values on error
    setStats({
      totalQuestions: 0,
      totalExams: 0,
      publishedExams: 0,
      draftExams: 0,
    });
    setRecentExams([]);
  } finally {
    setLoading(false);
  }
};


  const statsCards = [
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      link: '/teacher/questions',
    },
    {
      title: 'Total Exams',
      value: stats.totalExams,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      link: '/teacher/exams',
    },
    {
      title: 'Published',
      value: stats.publishedExams,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      link: '/teacher/exams',
    },
    {
      title: 'Drafts',
      value: stats.draftExams,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      link: '/teacher/exams',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your exams today
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/teacher/questions/create">
              <Plus className="mr-2 h-4 w-4" />
              New Question
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/teacher/exams/create">
              <Plus className="mr-2 h-4 w-4" />
              New Exam
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Exams */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Exams List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Exams</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/teacher/exams">View All</Link>
            </Button>
          </div>

          {recentExams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No exams created yet</p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/teacher/exams/create">Create Your First Exam</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExams.map((exam) => (
                <Link
                  key={exam._id}
                  to={`/teacher/exams/${exam._id}`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{exam.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject} • {exam.questions?.length || 0} questions
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        exam.isPublished
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-orange-500/10 text-orange-600'
                      }`}
                    >
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/teacher/questions/create"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Create Question</p>
                <p className="text-xs text-muted-foreground">
                  Add new questions to your bank
                </p>
              </div>
            </Link>

            <Link
              to="/teacher/exams/create"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Create Exam</p>
                <p className="text-xs text-muted-foreground">
                  Build exam from question bank
                </p>
              </div>
            </Link>

            <Link
              to="/teacher/analytics"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Track student performance
                </p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
