import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🎯 StudentDashboard: Loading dashboard data...');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📡 StudentDashboard: Fetching stats and attempts...');

      // Fetch stats and attempts in parallel
      const [statsResponse, attemptsResponse, examsResponse] = await Promise.all([
        ExamService.getAttemptStats().catch(() => ({ data: null })),
        ExamService.getMyAttempts().catch(() => ({ data: [] })),
        ExamService.getAllExams().catch(() => ({ data: [] })),
      ]);

      console.log('✅ StudentDashboard: Stats:', statsResponse.data);
      console.log('✅ StudentDashboard: Attempts:', attemptsResponse.data);
      console.log('✅ StudentDashboard: Exams:', examsResponse.data);

      // Set stats
      setStats(statsResponse.data || {
        totalAttempts: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
      });

      // Set recent attempts (last 5)
      const attempts = Array.isArray(attemptsResponse.data)
        ? attemptsResponse.data
        : attemptsResponse.data?.attempts || [];
      setRecentAttempts(attempts.slice(0, 5));

      // Set upcoming exams (published and not attempted)
      const exams = Array.isArray(examsResponse.data)
        ? examsResponse.data
        : examsResponse.data?.exams || [];
      
      const published = exams.filter(e => e.isPublished);
      setUpcomingExams(published.slice(0, 5));

    } catch (error) {
      console.error('❌ StudentDashboard: Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold">{stats?.totalAttempts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passed</p>
              <p className="text-2xl font-bold text-green-600">{stats?.passed || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Attempts & Upcoming Exams */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Attempts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Attempts</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/student/results">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-muted-foreground text-sm">No attempts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <Link
                  key={attempt._id}
                  to={`/student/results/${attempt._id}`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {attempt.exam?.title || attempt.examTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attempt.submitTime || attempt.completedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {attempt.score}/{attempt.totalMarks}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.percentage?.toFixed(0)}%
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          attempt.passed
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {attempt.passed ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Exams */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Available Exams</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/student/exams">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-muted-foreground text-sm">No exams available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <Link
                  key={exam._id}
                  to={`/student/exams`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">{exam.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {exam.duration} mins
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exam.totalMarks} marks
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
