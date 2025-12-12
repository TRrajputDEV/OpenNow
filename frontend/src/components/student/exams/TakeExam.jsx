import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
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
  const { id: rawId } = useParams();
  const examId = (rawId || "").trim();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [examData, setExamData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initExam();
  }, [examId]);

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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examData && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examData, submitting]);

  const initExam = async () => {
    try {
      setLoading(true);

      const examResp = await ExamService.getExamById(examId);

      const exam =
        examResp.data?.exam || examResp.data || examResp.exam || examResp;

      if (!exam || !Array.isArray(exam.questions)) {
        throw new Error("Invalid exam data received");
      }

      const attemptData = await ExamService.startExamAttempt(examId);

      setAttemptId(attemptData._id || attemptData.id);

      const normalizedQuestions = exam.questions.map((q) => {
        const base = q.question || q;
        return {
          _id: base._id,
          type: base.type,
          questionText: base.questionText,
          options: base.options || [],
          marks: q.marks || base.marks || 1,
        };
      });

      const uiExamData = {
        examTitle: exam.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        questions: normalizedQuestions,
      };

      setExamData(uiExamData);
      setTimeRemaining((exam.duration || 0) * 60);

      const initialAnswers = {};
      normalizedQuestions.forEach((q) => {
        initialAnswers[q._id] = null;
      });
      setAnswers(initialAnswers);

      toast({
        title: "Exam Started",
        description: `You have ${exam.duration} minutes to complete this exam`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to start exam",
      });
      navigate("/student/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    try {
      await ExamService.saveAnswer(attemptId, {
        questionId,
        answer,
      });
    } catch (error) {
    }
  };

  const toggleFlag = () => {
    const questionId = examData.questions[currentQuestionIndex]._id;

    setFlaggedQuestions((prev) => {
      const s = new Set(prev);
      if (s.has(questionId)) {
        s.delete(questionId);
      } else {
        s.add(questionId);
      }
      return s;
    });
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
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
      const resp = await ExamService.submitExamAttempt(attemptId, {});

      const result = resp.data?.data || resp.data || resp;

      toast({
        title: "Success",
        description: `Exam submitted! Your score: ${result.score}/${result.totalMarks}`,
      });

      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to submit exam",
      });
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const s = Number(seconds || 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getQuestionStatus = (index) => {
    const questionId = examData.questions[index]._id;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Starting exam...</p>
        </div>
      </div>
    );
  }

  if (!examData) return null;

  const answeredCount = Object.values(answers).filter((a) => a !== null).length;
  const unansweredCount = examData.questions.length - answeredCount;
  const currentQuestion = examData.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">{examData.examTitle}</h1>
              <p className="text-xs text-muted-foreground">
                {examData.questions.length} Questions
              </p>
            </div>

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

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-semibold">
                    {currentQuestionIndex + 1}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of{" "}
                      {examData.questions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentQuestion.marks}{" "}
                      {currentQuestion.marks === 1 ? "mark" : "marks"}
                    </p>
                  </div>
                </div>

                <Button
                  variant={
                    flaggedQuestions.has(currentQuestion._id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-lg font-medium leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.type === "true-false" ? (
                  <>
                    {["True", "False"].map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          handleAnswer(currentQuestion._id, option)
                        }
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          answers[currentQuestion._id] === option
                            ? "border-foreground bg-accent"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestion._id] === option
                                ? "border-foreground bg-foreground"
                                : "border-border"
                            }`}
                          >
                            {answers[currentQuestion._id] === option && (
                              <div className="h-2 w-2 rounded-full bg-background" />
                            )}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </button>
                    ))}
                  </>
                ) : currentQuestion.type === "multiple-correct" ? (
                  <>
                    {currentQuestion.options.map((option, index) => {
                      const currentAnswers = answers[currentQuestion._id] || [];
                      const isChecked = currentAnswers.includes(option);

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            const newAnswers = isChecked
                              ? currentAnswers.filter((a) => a !== option)
                              : [...currentAnswers, option];
                            handleAnswer(currentQuestion._id, newAnswers);
                          }}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
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
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleAnswer(currentQuestion._id, option)
                        }
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          answers[currentQuestion._id] === option
                            ? "border-foreground bg-accent"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestion._id] === option
                                ? "border-foreground bg-foreground"
                                : "border-border"
                            }`}
                          >
                            {answers[currentQuestion._id] === option && (
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
                  disabled={
                    currentQuestionIndex === examData.questions.length - 1
                  }
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <List className="h-4 w-4" />
                Question Palette
              </h3>

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

              <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((q, index) => {
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

      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>Are you sure you want to submit your exam?</p>
                <div className="p-4 rounded-lg bg-secondary space-y-2 text-sm">
                  ...
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
