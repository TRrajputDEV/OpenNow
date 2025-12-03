import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { QuestionService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, filterType, filterSubject]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await QuestionService.getAllQuestions();

      // Handle different response structures
      const questionsData = response.data?.questions || response.data || [];
      console.log("Questions response:", response.data); // Debug log

      // Ensure it's an array
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error("Fetch error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch questions",
      });
      setQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((q) =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter - ✅ Changed from questionType to type
    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.type === filterType);
    }

    // Subject filter
    if (filterSubject !== "all") {
      filtered = filtered.filter((q) => q.subject === filterSubject);
    }

    setFilteredQuestions(filtered);
  };

  const handleDelete = async () => {
    try {
      await QuestionService.deleteQuestion(questionToDelete);
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      fetchQuestions();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete question",
      });
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      "single-correct": "Single Correct",
      "multiple-correct": "Multiple Correct",
      "true-false": "True/False",
    };
    return types[type] || type;
  };

  const getQuestionTypeBadge = (type) => {
    const colors = {
      "single-correct": "bg-blue-500/10 text-blue-600",
      "multiple-correct": "bg-purple-500/10 text-purple-600",
      "true-false": "bg-green-500/10 text-green-600",
    };
    return colors[type] || "bg-gray-500/10 text-gray-600";
  };

  // Get unique subjects
  const subjects = [...new Set(questions.map((q) => q.subject))];

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
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            Manage your question library
          </p>
        </div>
        <Button asChild>
          <Link to="/teacher/questions/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Types</option>
            <option value="single-correct">Single Correct</option>
            <option value="multiple-correct">Multiple Correct</option>
            <option value="true-false">True/False</option>
          </select>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Single Correct</p>
          <p className="text-2xl font-bold mt-1">
            {questions.filter((q) => q.type === "single-correct").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Multiple Correct</p>
          <p className="text-2xl font-bold mt-1">
            {questions.filter((q) => q.type === "multiple-correct").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">True/False</p>
          <p className="text-2xl font-bold mt-1">
            {questions.filter((q) => q.type === "true-false").length}
          </p>
        </Card>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground mb-6">
              {questions.length === 0
                ? "Start building your question bank by creating your first question"
                : "Try adjusting your filters"}
            </p>
            {questions.length === 0 && (
              <Button asChild>
                <Link to="/teacher/questions/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Question
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Question Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getQuestionTypeBadge(
                          question.type // ✅ Changed from questionType to type
                        )}`}
                      >
                        {getQuestionTypeLabel(question.type)} {/* ✅ Changed */}
                      </span>
                      {/* Rest stays the same */}
                    </div>

                    {/* Question Text */}
                    <p className="font-medium mb-3 line-clamp-2">
                      {question.questionText}
                    </p>

                    {/* Options Preview */}
                    {question.type !== "true-false" && ( // ✅ Changed
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {question.options.slice(0, 4).map((option, i) => {
                          // ✅ Fix correctAnswer check
                          const isCorrect = Array.isArray(
                            question.correctAnswer
                          )
                            ? question.correctAnswer.includes(option)
                            : question.correctAnswer === option;

                          return (
                            <div
                              key={i}
                              className={`text-sm px-3 py-2 rounded border ${
                                isCorrect
                                  ? "bg-green-500/10 border-green-500/20 text-green-700"
                                  : "bg-secondary"
                              }`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {option}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "true-false" && ( // ✅ Changed
                      <div className="flex gap-2">
                        <span
                          className={`text-sm px-3 py-2 rounded border ${
                            question.correctAnswer === "True"
                              ? "bg-green-500/10 border-green-500/20 text-green-700"
                              : "bg-secondary"
                          }`}
                        >
                          True
                        </span>
                        <span
                          className={`text-sm px-3 py-2 rounded border ${
                            question.correctAnswer === "False"
                              ? "bg-green-500/10 border-green-500/20 text-green-700"
                              : "bg-secondary"
                          }`}
                        >
                          False
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit Question"
                    >
                      <Link to={`/teacher/questions/edit/${question._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setQuestionToDelete(question._id);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question from your question bank.
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

export default QuestionsList;
