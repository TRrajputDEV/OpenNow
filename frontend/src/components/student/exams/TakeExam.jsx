import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Send,
  List,
} from "lucide-react";
import { ExamService } from "@/services";
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

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [id]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Warning before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (exam && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [exam, submitting]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await ExamService.getExamById(id);
      const examData = response.data;

      // Check if exam can be attempted
      const now = new Date();
      if (now < new Date(examData.startTime)) {
        toast({
          variant: "destructive",
          title: "Exam Not Started",
          description: "This exam has not started yet",
        });
        navigate("/student/exams");
        return;
      }

      if (now > new Date(examData.endTime)) {
        toast({
          variant: "destructive",
          title: "Exam Ended",
          description: "This exam has already ended",
        });
        navigate("/student/exams");
        return;
      }

      setExam(examData);
      setTimeRemaining(examData.duration * 60); // Convert to seconds

      // Initialize answers
      const initialAnswers = {};
      examData.questions.forEach((q) => {
        initialAnswers[q.question._id] = null;
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch exam",
      });
      navigate("/student/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = () => {
    const questionId = exam.questions[currentQuestionIndex].question._id;
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowQuestionPalette(false);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    toast({
      title: "Time Up!",
      description: "Your exam has been automatically submitted",
    });
    handleSubmit(true);
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto) {
      setSubmitDialogOpen(false);
    }

    setSubmitting(true);
    try {
      // Format answers for submission
      const formattedAnswers = exam.questions.map((q) => ({
        questionId: q.question._id,
        answer: answers[q.question._id],
      }));

      // Submit exam
      const response = await ExamService.submitExamAttempt(id, {
        answers: formattedAnswers,
        timeTaken: exam.duration * 60 - timeRemaining,
      });

      const attemptId = response.data?._id || response.data?.id;

      toast({
        title: "Success",
        description: "Exam submitted successfully! 🎉",
      });

      // Navigate to results page
      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit exam",
      });
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getQuestionStatus = (index) => {
    const questionId = exam.questions[index].question._id;
    const isAnswered = answers[questionId] !== null;
    const isFlagged = flaggedQuestions.has(questionId);

    if (isFlagged) return "flagged";
    if (isAnswered) return "answered";
    return "unanswered";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "flagged":
        return "bg-orange-500 text-white";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const answeredCount = Object.values(answers).filter((a) => a !== null).length;
  const unansweredCount = exam?.questions.length - answeredCount || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const question = currentQuestion.question;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Exam Info */}
            <div>
              <h1 className="font-semibold text-lg">{exam.title}</h1>
              <p className="text-xs text-muted-foreground">
                {exam.subject} • {exam.questions.length} Questions
              </p>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                timeRemaining < 300
                  ? "bg-red-500/10 text-red-600"
                  : "bg-blue-500/10 text-blue-600"
              }`}
            >
              <Clock className="h-5 w-5" />
              <span className="text-xl">{formatTime(timeRemaining)}</span>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => setSubmitDialogOpen(true)}
              disabled={submitting}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Section */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-semibold">
                    {currentQuestionIndex + 1}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of{" "}
                      {exam.questions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentQuestion.marks}{" "}
                      {currentQuestion.marks === 1 ? "mark" : "marks"}
                    </p>
                  </div>
                </div>

                <Button
                  variant={
                    flaggedQuestions.has(question._id) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-lg font-medium leading-relaxed">
                  {question.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.type === "true-false" ? (
                  <>
                    {["True", "False"].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question._id, option)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          answers[question._id] === option
                            ? "border-foreground bg-accent"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              answers[question._id] === option
                                ? "border-foreground bg-foreground"
                                : "border-border"
                            }`}
                          >
                            {answers[question._id] === option && (
                              <div className="h-2 w-2 rounded-full bg-background" />
                            )}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </button>
                    ))}
                  </>
                ) : question.type === "multiple-correct" ? (
                  <>
                    {question.options.map((option, index) => {
                      const currentAnswers = answers[question._id] || [];
                      const isChecked = currentAnswers.includes(option);

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            const newAnswers = isChecked
                              ? currentAnswers.filter((a) => a !== option)
                              : [...currentAnswers, option];
                            handleAnswer(question._id, newAnswers);
                          }}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            isChecked
                              ? "border-foreground bg-accent"
                              : "border-border hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isChecked} />
                            <span>
                              <span className="font-semibold mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(question._id, option)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          answers[question._id] === option
                            ? "border-foreground bg-accent"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              answers[question._id] === option
                                ? "border-foreground bg-foreground"
                                : "border-border"
                            }`}
                          >
                            {answers[question._id] === option && (
                              <div className="h-2 w-2 rounded-full bg-background" />
                            )}
                          </div>
                          <span>
                            <span className="font-semibold mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === exam.questions.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <List className="h-4 w-4" />
                Question Palette
              </h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <p className="font-semibold text-green-600">
                    {answeredCount}
                  </p>
                  <p className="text-muted-foreground">Answered</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-500/10">
                  <p className="font-semibold text-gray-600">
                    {unansweredCount}
                  </p>
                  <p className="text-muted-foreground">Pending</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <p className="font-semibold text-orange-600">
                    {flaggedQuestions.size}
                  </p>
                  <p className="text-muted-foreground">Flagged</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((q, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`h-10 rounded-lg font-semibold text-sm transition-all ${
                        index === currentQuestionIndex
                          ? "ring-2 ring-foreground ring-offset-2"
                          : ""
                      } ${getStatusColor(status)}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>Are you sure you want to submit your exam?</p>
                <div className="p-4 rounded-lg bg-secondary space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span className="font-semibold">
                      {exam.questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-semibold text-green-600">
                      {answeredCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unanswered:</span>
                    <span className="font-semibold text-red-600">
                      {unansweredCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Remaining:</span>
                    <span className="font-semibold">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
                {unansweredCount > 0 && (
                  <p className="text-orange-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    You have {unansweredCount} unanswered question(s)
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeExam;
