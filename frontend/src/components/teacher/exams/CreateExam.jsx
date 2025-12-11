import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { QuestionService, ExamService } from "@/services";
import { useToast } from "@/hooks/use-toast";


const CreateExam = ({ examId = null }) => {  // ← Accept examId prop
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!examId;  // ← Detect edit mode
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingExam, setLoadingExam] = useState(isEditMode);  // ← Loading state for fetching exam
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    duration: 60,
    totalMarks: 0,
    passingMarks: 0,
    instructions: "",
    scheduledDate: "",
    scheduledTime: "",
    selectedQuestions: [],
  });

  // ← Fetch exam data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchExamData();
    }
  }, [examId]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, filterSubject]);

  useEffect(() => {
    // Calculate total marks when questions change
    const total = formData.selectedQuestions.reduce((sum, qId) => {
      const question = questions.find((q) => q._id === qId);
      return sum + (question?.marks || 0);
    }, 0);
    setFormData((prev) => ({ ...prev, totalMarks: total }));
  }, [formData.selectedQuestions, questions]);

  // ← NEW: Fetch exam data for edit mode
  const fetchExamData = async () => {
    try {
      setLoadingExam(true);
      const response = await ExamService.getExamById(examId);
      const exam = response.data?.exam || response.data;

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Extract date and time from startTime if exists
      let scheduledDate = '';
      let scheduledTime = '';
      if (exam.startTime) {
        const startDate = new Date(exam.startTime);
        scheduledDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        scheduledTime = startDate.toTimeString().slice(0, 5); // HH:MM
      }

      // Extract question IDs from exam.questions array
      const selectedQuestions = exam.questions?.map(q => 
        q.question?._id || q.question || q._id
      ) || [];

      // Populate form with existing data
      setFormData({
        title: exam.title || '',
        description: exam.description || '',
        subject: exam.subject || '',
        duration: exam.duration || 60,
        totalMarks: exam.totalMarks || 0,
        passingMarks: exam.passingMarks || 0,
        instructions: exam.instructions || '',
        scheduledDate,
        scheduledTime,
        selectedQuestions,
      });

      toast({
        title: 'Exam loaded',
        description: 'You can now edit the exam details',
      });
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load exam data',
      });
      navigate('/teacher/exams');
    } finally {
      setLoadingExam(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await QuestionService.getAllQuestions();
      const questionsData = response.data || [];
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch questions",
      });
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    if (searchQuery) {
      filtered = filtered.filter((q) =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterSubject !== "all") {
      filtered = filtered.filter((q) => q.subject === filterSubject);
    }

    setFilteredQuestions(filtered);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionId)
        ? prev.selectedQuestions.filter((id) => id !== questionId)
        : [...prev.selectedQuestions, questionId],
    }));
  };

  const selectAll = () => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestions: filteredQuestions.map((q) => q._id),
    }));
  };

  const deselectAll = () => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestions: [],
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Exam title is required",
        });
        return;
      }
      if (!formData.subject.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Subject is required",
        });
        return;
      }
      if (formData.duration < 1) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Duration must be at least 1 minute",
        });
        return;
      }
    }

    if (step === 2) {
      if (formData.selectedQuestions.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select at least one question",
        });
        return;
      }
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Final validation
    if (formData.passingMarks > formData.totalMarks) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passing marks cannot exceed total marks",
      });
      return;
    }

    if (formData.selectedQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one question",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate start and end time
      const now = new Date();
      let startTime, endTime;

      if (formData.scheduledDate && formData.scheduledTime) {
        // Use scheduled date/time
        startTime = new Date(
          `${formData.scheduledDate}T${formData.scheduledTime}`
        );
      } else {
        // Default to now
        startTime = new Date(now.getTime() + 60000); // Start 1 minute from now
      }

      // Calculate end time based on duration
      endTime = new Date(startTime.getTime() + formData.duration * 60000);

      // Format questions array as backend expects
      const formattedQuestions = formData.selectedQuestions.map(
        (qId, index) => {
          const question = questions.find((q) => q._id === qId);
          return {
            question: qId,
            marks: question?.marks || 1,
            order: index + 1,
          };
        }
      );

      const examData = {
        title: formData.title.trim(),
        description: formData.description.trim() || "No description provided",
        subject: formData.subject.trim(),
        duration: formData.duration,
        passingMarks:
          formData.passingMarks || Math.floor(formData.totalMarks * 0.4),
        instructions:
          formData.instructions.trim() ||
          "Read all questions carefully before answering. Once submitted, answers cannot be changed.",
        questions: formattedQuestions,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        settings: {
          shuffleQuestions: false,
          showResultsImmediately: true,
          allowReview: true,
          partialMarking: false,
          negativeMarking: false,
          negativeMarkingValue: 0,
        },
        allowedStudents: "all",
        specificStudents: [],
      };

      console.log("Sending exam data:", examData); // DEBUG

      // ← UPDATED: Call update or create based on mode
      if (isEditMode) {
        await ExamService.updateExam(examId, examData);
        toast({
          title: "Success",
          description: "Exam updated successfully",
        });
      } else {
        await ExamService.createExam(examData);
        toast({
          title: "Success",
          description: "Exam created successfully as draft",
        });
      }

      navigate("/teacher/exams");
    } catch (error) {
      console.error("Error saving exam:", error); // DEBUG
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} exam`,
      });
    } finally {
      setLoading(false);
    }
  };

  const subjects = [...new Set(questions.map((q) => q.subject))];

  // ← Show loading state while fetching exam
  if (loadingExam) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/teacher/exams")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          {/* ← UPDATED: Dynamic title */}
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Exam' : 'Create Exam'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? 'Update exam details' : 'Build your exam from question bank'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Basic Details" },
            { num: 2, label: "Select Questions" },
            { num: 3, label: "Settings & Review" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s.num
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                </div>
                <p className="text-xs mt-2 font-medium">{s.label}</p>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-all ${
                    step > s.num ? "bg-foreground" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Exam Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Mathematics Mid-Term Exam"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the exam..."
                      value={formData.description}
                      onChange={(e) =>
                        updateFormData("description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={formData.subject}
                        onChange={(e) =>
                          updateFormData("subject", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) =>
                          updateFormData("duration", parseInt(e.target.value))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Exam instructions for students..."
                      value={formData.instructions}
                      onChange={(e) =>
                        updateFormData("instructions", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Select Questions */}
          {step === 2 && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Select Questions</h2>
                  <p className="text-sm text-muted-foreground">
                    {formData.selectedQuestions.length} questions selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
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

              {/* Questions List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No questions found</p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => (
                    <div
                      key={question._id}
                      onClick={() => toggleQuestion(question._id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent ${
                        formData.selectedQuestions.includes(question._id)
                          ? "border-foreground bg-accent"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={formData.selectedQuestions.includes(
                            question._id
                          )}
                          onCheckedChange={() => toggleQuestion(question._id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded bg-secondary">
                              {question.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {question.subject}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {question.marks} marks
                            </span>
                          </div>
                          <p className="font-medium line-clamp-2">
                            {question.questionText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Settings & Review */}
          {step === 3 && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Final Settings</h2>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passingMarks">Passing Marks</Label>
                      <Input
                        id="passingMarks"
                        type="number"
                        min="0"
                        max={formData.totalMarks}
                        value={formData.passingMarks}
                        onChange={(e) =>
                          updateFormData(
                            "passingMarks",
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Out of {formData.totalMarks} marks
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Scheduled Date (Optional)
                      </Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) =>
                          updateFormData("scheduledDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">
                        <Clock className="inline h-4 w-4 mr-2" />
                        Scheduled Time (Optional)
                      </Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) =>
                          updateFormData("scheduledTime", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-4 rounded-lg bg-secondary space-y-3">
                <h3 className="font-semibold">Exam Summary</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subject</p>
                    <p className="font-medium">{formData.subject}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-medium">
                      {formData.selectedQuestions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{formData.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Marks</p>
                    <p className="font-medium">{formData.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Passing Marks</p>
                    <p className="font-medium">{formData.passingMarks}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {/* ← UPDATED: Dynamic button text */}
                  {loading 
                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                    : (isEditMode ? 'Update Exam' : 'Create Exam (Draft)')
                  }
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CreateExam;
