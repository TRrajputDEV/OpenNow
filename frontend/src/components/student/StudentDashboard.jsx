import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    availableExams: 0,
    completedExams: 0,
    averageScore: 0,
    upcomingExams: 0,
  });
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls when endpoints are ready
      
      // Mock data for now
      setStats({
        availableExams: 5,
        completedExams: 3,
        averageScore: 85,
        upcomingExams: 2,
      });

      setUpcomingExams([
        {
          _id: '1',
          title: 'Mathematics Mid-Term',
          subject: 'Mathematics',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          duration: 60,
          totalMarks: 100,
        },
      ]);

      setRecentResults([
        {
          _id: '1',
          examTitle: 'Physics Quiz',
          score: 85,
          totalMarks: 100,
          percentage: 85,
          completedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Available Exams',
      value: stats.availableExams,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      link: '/student/exams',
    },
    {
      title: 'Completed',
      value: stats.completedExams,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      link: '/student/history',
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      link: '/student/results',
    },
    {
      title: 'Upcoming',
      value: stats.upcomingExams,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      link: '/student/exams',
    },
  ];

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to ace your exams today?
        </p>
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Exams</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/student/exams">View All</Link>
            </Button>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No upcoming exams</p>
              <Button asChild className="mt-4" size="sm" variant="outline">
                <Link to="/student/exams">Browse Available Exams</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <Link
                  key={exam._id}
                  to={`/student/exams/${exam._id}`}
                  className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{exam.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
                      Upcoming
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(exam.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exam.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {exam.totalMarks} marks
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Results */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Results</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/student/results">View All</Link>
            </Button>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No results yet</p>
              <p className="text-sm mt-1">Take an exam to see your results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <Link
                  key={result._id}
                  to={`/student/results/${result._id}`}
                  className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{result.examTitle}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(result.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {result.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.score}/{result.totalMarks}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        result.percentage >= 40
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {result.percentage >= 40 ? 'Passed' : 'Failed'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/student/exams"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Browse Exams</p>
              <p className="text-xs text-muted-foreground">
                View all available exams
              </p>
            </div>
          </Link>

          <Link
            to="/student/results"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">My Results</p>
              <p className="text-xs text-muted-foreground">
                Check your performance
              </p>
            </div>
          </Link>

          <Link
            to="/student/history"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">History</p>
              <p className="text-xs text-muted-foreground">
                View past attempts
              </p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
