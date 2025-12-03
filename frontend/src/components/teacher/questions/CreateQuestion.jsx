import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, X, CheckCircle2 } from "lucide-react";
import { QuestionService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const CreateQuestion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    questionText: "",
    questionType: "single-correct",
    subject: "",
    marks: 1,
    difficulty: "medium",
    options: ["", "", "", ""],
    correctAnswer: [],
  });

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
    if (formData.questionType === "single-correct") {
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

    if (formData.questionType === "true-false") {
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
      // ✅ FIX: Backend expects 'type' not 'questionType'
      // ✅ FIX: Backend expects 'category' field
      // ✅ FIX: correctAnswer should be string for single-correct, array for multiple-correct
      const questionData = {
        type: formData.questionType, // ✅ Changed from questionType to type
        questionText: formData.questionText.trim(),
        subject: formData.subject.trim(),
        category: formData.subject.trim(), // ✅ Added category (using subject for now)
        marks: formData.marks,
        difficulty: formData.difficulty,
        options:
          formData.questionType === "true-false"
            ? ["True", "False"]
            : formData.options.filter((opt) => opt.trim()),
        correctAnswer:
          formData.questionType === "single-correct" ||
          formData.questionType === "true-false"
            ? formData.correctAnswer[0] // ✅ String for single-correct and true-false
            : formData.correctAnswer, // ✅ Array for multiple-correct
      };

      console.log("Sending question data:", questionData); // DEBUG LOG

      await QuestionService.createQuestion(questionData);

      toast({
        title: "Success",
        description: "Question created successfully",
      });
      navigate("/teacher/questions");
    } catch (error) {
      console.error("Error creating question:", error); // DEBUG LOG

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create question",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Create Question</h1>
          <p className="text-muted-foreground mt-1">
            Add a new question to your bank
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <Label>Question Type *</Label>
            <select
              value={formData.questionType}
              onChange={(e) => {
                updateFormData("questionType", e.target.value);
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
                {formData.questionType === "true-false"
                  ? "Correct Answer *"
                  : "Options *"}
              </Label>
              {formData.questionType !== "true-false" && (
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

            {formData.questionType === "true-false" ? (
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
              {formData.questionType === "single-correct" &&
                "Click the checkbox to mark the correct answer"}
              {formData.questionType === "multiple-correct" &&
                "Click multiple checkboxes to mark all correct answers"}
              {formData.questionType === "true-false" &&
                "Select the correct answer"}
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
              {loading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateQuestion;
