import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Search,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const Results = () => {
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAttempts();
  }, []);

  useEffect(() => {
    filterAttempts();
  }, [attempts, searchQuery, filterStatus]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      
      const response = await ExamService.getMyAttempts();
      
      let attemptsData = response.data;

      // Handle different response structures
      if (Array.isArray(attemptsData)) {
        setAttempts(attemptsData);
      } else if (attemptsData?.attempts && Array.isArray(attemptsData.attempts)) {
        setAttempts(attemptsData.attempts);
      } else {
        setAttempts([]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch results',
      });
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAttempts = () => {
    let filtered = [...attempts];

    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a?.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => {
        const status = a?.passed ? 'passed' : 'failed';
        return status === filterStatus;
      });
    }

    setFilteredAttempts(filtered);
  };

  const calculateStats = () => {
    if (attempts.length === 0) {
      return { total: 0, passed: 0, failed: 0, avgPercentage: 0 };
    }

    const total = attempts.length;
    const passed = attempts.filter((a) => a?.passed).length;
    const failed = total - passed;
    const avgPercentage = (
      attempts.reduce((sum, a) => sum + (a?.percentage || 0), 0) / total
    ).toFixed(2);

    return { total, passed, failed, avgPercentage };
  };

  const stats = calculateStats();

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
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Results</h1>
        <p className="text-muted-foreground mt-1">View all your exam results</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
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
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-2xl font-bold">{stats.avgPercentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      {/* Results List */}
      {filteredAttempts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              {attempts.length === 0
                ? "You haven't attempted any exams yet"
                : 'Try adjusting your filters'}
            </p>
            {attempts.length === 0 && (
              <Button asChild>
                <Link to="/student/exams">Browse Exams</Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAttempts.map((attempt, index) => {
            const isPassed = attempt?.passed;
            const percentage = attempt?.percentage || 0;
            const totalQuestions = attempt?.answers?.length || 0;
            const correctAnswers = attempt?.correctAnswers || 
              attempt?.answers?.filter(a => a.isCorrect).length || 0;

            return (
              <motion.div
                key={attempt?._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {attempt?.exam?.title || attempt?.examTitle || 'Untitled Exam'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {attempt?.exam?.subject || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isPassed
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Score</p>
                          <p className="text-lg font-bold">
                            {attempt?.score || 0}/{attempt?.totalMarks || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Percentage
                          </p>
                          <p className="text-lg font-bold">{percentage.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Correct Answers
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {correctAnswers}/{totalQuestions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date</p>
                          <p className="text-sm font-medium">
                            {formatDate(attempt?.submitTime || attempt?.completedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button asChild>
                      <Link to={`/student/results/${attempt?._id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
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

export default Results;
