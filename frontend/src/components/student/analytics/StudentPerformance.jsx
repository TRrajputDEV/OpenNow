import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Target,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const StudentPerformance = () => {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and attempts in parallel
      const [statsResponse, attemptsResponse] = await Promise.all([
        ExamService.getAttemptStats(),
        ExamService.getMyAttempts(),
      ]);

      const statsData = statsResponse.data?.data || statsResponse.data || {};
      const attemptsData = Array.isArray(attemptsResponse.data)
        ? attemptsResponse.data
        : attemptsResponse.data?.attempts || [];

      setStats(statsData);
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load performance data',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubjectStats = () => {
    const subjectMap = {};

    attempts.forEach((attempt) => {
      const subject = attempt.exam?.subject || 'Unknown';
      
      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          totalAttempts: 0,
          totalScore: 0,
          totalMarks: 0,
          passed: 0,
          failed: 0,
        };
      }

      subjectMap[subject].totalAttempts++;
      subjectMap[subject].totalScore += attempt.score || 0;
      subjectMap[subject].totalMarks += attempt.totalMarks || 0;
      
      if (attempt.passed) {
        subjectMap[subject].passed++;
      } else {
        subjectMap[subject].failed++;
      }
    });

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      ...data,
      average: data.totalMarks > 0 
        ? ((data.totalScore / data.totalMarks) * 100).toFixed(1)
        : 0,
      passRate: data.totalAttempts > 0
        ? ((data.passed / data.totalAttempts) * 100).toFixed(0)
        : 0,
    }));
  };

  const getRecentTrend = () => {
    return attempts
      .slice(0, 10)
      .map((attempt) => ({
        title: attempt.exam?.title || 'Unknown',
        subject: attempt.exam?.subject || 'Unknown',
        percentage: attempt.percentage || 0,
        passed: attempt.passed,
        date: new Date(attempt.submitTime || attempt.createdAt),
      }))
      .sort((a, b) => b.date - a.date);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  const subjectStats = getSubjectStats();
  const recentTrend = getRecentTrend();
  const passRate = stats?.totalAttempts > 0
    ? ((stats.passed / stats.totalAttempts) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and improvement over time
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold">{stats?.totalAttempts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">{passRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">
                {stats?.totalCorrectAnswers + stats?.totalIncorrectAnswers > 0
                  ? (
                      (stats.totalCorrectAnswers /
                        (stats.totalCorrectAnswers + stats.totalIncorrectAnswers)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject-wise Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Subject-wise Performance
        </h2>

        {subjectStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No subject data available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subjectStats.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{subject.subject}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {subject.totalAttempts} {subject.totalAttempts === 1 ? 'attempt' : 'attempts'}
                    </span>
                    <span className="font-medium text-green-600">
                      {subject.passRate}% pass rate
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Average</p>
                    <p className="font-semibold text-lg">{subject.average}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Passed</p>
                    <p className="font-semibold text-lg text-green-600">
                      {subject.passed}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="font-semibold text-lg text-red-600">
                      {subject.failed}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Score</p>
                    <p className="font-semibold text-lg">
                      {subject.totalScore}/{subject.totalMarks}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Performance Trend */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Performance
        </h2>

        {recentTrend.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent attempts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTrend.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subject}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(item.date)}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold">{item.percentage.toFixed(1)}%</p>
                    {item.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentPerformance;
