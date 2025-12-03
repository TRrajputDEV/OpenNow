import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, X, CheckCircle2 } from "lucide-react";
import { QuestionService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    questionText: "",
    type: "single-correct",
    subject: "",
    marks: 1,
    difficulty: "medium",
    options: ["", "", "", ""],
    correctAnswer: [],
  });

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setFetching(true);
      const response = await QuestionService.getQuestionById(id);

      // Handle response structure: response.data contains the question
      const question = response.data;
      console.log("Fetched question:", question); // DEBUG

      // Convert correctAnswer to array format for form handling
      const correctAnswerArray = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];

      setFormData({
        questionText: question.questionText,
        type: question.type,
        subject: question.subject,
        marks: question.marks,
        difficulty: question.difficulty,
        options:
          question.options.length > 0 ? question.options : ["", "", "", ""],
        correctAnswer: correctAnswerArray,
      });
    } catch (error) {
      console.error("Fetch error:", error); // DEBUG
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch question",
      });
      navigate("/teacher/questions");
    } finally {
      setFetching(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const newCorrect = formData.correctAnswer.filter(
        (ans) => ans !== formData.options[index]
      );
      setFormData((prev) => ({
        ...prev,
        options: newOptions,
        correctAnswer: newCorrect,
      }));
    }
  };

  const toggleCorrectAnswer = (option) => {
    if (formData.type === "single-correct") {
      setFormData((prev) => ({ ...prev, correctAnswer: [option] }));
    } else {
      const isSelected = formData.correctAnswer.includes(option);
      setFormData((prev) => ({
        ...prev,
        correctAnswer: isSelected
          ? prev.correctAnswer.filter((ans) => ans !== option)
          : [...prev.correctAnswer, option],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Question text is required",
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

    if (formData.type === "true-false") {
      if (formData.correctAnswer.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select the correct answer",
        });
        return;
      }
    } else {
      const validOptions = formData.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "At least 2 options are required",
        });
        return;
      }

      if (formData.correctAnswer.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select at least one correct answer",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const questionData = {
        type: formData.type,
        questionText: formData.questionText.trim(),
        subject: formData.subject.trim(),
        category: formData.subject.trim(),
        marks: formData.marks,
        difficulty: formData.difficulty,
        options:
          formData.type === "true-false"
            ? ["True", "False"]
            : formData.options.filter((opt) => opt.trim()),
        correctAnswer:
          formData.type === "single-correct" || formData.type === "true-false"
            ? formData.correctAnswer[0]
            : formData.correctAnswer,
      };

      await QuestionService.updateQuestion(id, questionData);

      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      navigate("/teacher/questions");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update question",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/teacher/questions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Question</h1>
          <p className="text-muted-foreground mt-1">Update question details</p>
        </div>
      </div>

      {/* Form - Same as CreateQuestion */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <Label>Question Type *</Label>
            <select
              value={formData.type}
              onChange={(e) => {
                updateFormData("type", e.target.value);
                updateFormData("correctAnswer", []);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="single-correct">Single Correct (MCQ)</option>
              <option value="multiple-correct">Multiple Correct</option>
              <option value="true-false">True/False</option>
            </select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              placeholder="Enter your question here..."
              value={formData.questionText}
              onChange={(e) => updateFormData("questionText", e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Subject and Marks */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={formData.subject}
                onChange={(e) => updateFormData("subject", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">Marks *</Label>
              <Input
                id="marks"
                type="number"
                min="1"
                value={formData.marks}
                onChange={(e) =>
                  updateFormData("marks", parseInt(e.target.value))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => updateFormData("difficulty", e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>
                {formData.type === "true-false"
                  ? "Correct Answer *"
                  : "Options *"}
              </Label>
              {formData.type !== "true-false" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={formData.options.length >= 6}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>

            {formData.type === "true-false" ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => updateFormData("correctAnswer", ["True"])}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.correctAnswer.includes("True")
                      ? "border-green-500 bg-green-500/10"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">True</span>
                    {formData.correctAnswer.includes("True") && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData("correctAnswer", ["False"])}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.correctAnswer.includes("False")
                      ? "border-green-500 bg-green-500/10"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">False</span>
                    {formData.correctAnswer.includes("False") && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCorrectAnswer(option)}
                      disabled={!option.trim()}
                      className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                        formData.correctAnswer.includes(option)
                          ? "border-green-500 bg-green-500/10"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {formData.correctAnswer.includes(option) && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </button>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-red-600"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {formData.type === "single-correct" &&
                "Click the checkbox to mark the correct answer"}
              {formData.type === "multiple-correct" &&
                "Click multiple checkboxes to mark all correct answers"}
              {formData.type === "true-false" && "Select the correct answer"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/teacher/questions")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Question"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditQuestion;
