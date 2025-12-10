import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['single-correct', 'multiple-correct', 'true-false'],
        required: [true, 'Question type is required']
    },
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        minlength: [10, 'Question must be at least 10 characters'],
        maxlength: [1000, 'Question cannot exceed 1000 characters']
    },
    options: [{
        type: String,
        trim: true
    }],
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Correct answer is required']
    },
    marks: {
        type: Number,
        required: [true, 'Marks are required'],
        min: [0.5, 'Marks must be at least 0.5'],
        default: 1
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        index: true
    },
    explanation: {
        type: String,
        trim: true,
        maxlength: [500, 'Explanation cannot exceed 500 characters']
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        enum: ['manual', 'ai-generated'],
        default: 'manual'
    },
    aiMetadata: {
        prompt: String,
        model: String,
        generatedAt: Date,
        approved: { type: Boolean, default: false }
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

QuestionSchema.index({ createdBy: 1, isActive: 1 });
QuestionSchema.index({ category: 1, difficulty: 1 });
QuestionSchema.index({ subject: 1, category: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.pre('save', function(next) {
    if (this.type === 'true-false') {
        this.options = ['True', 'False'];
    }
    
    if ((this.type === 'single-correct' || this.type === 'multiple-correct') && this.options.length < 2) {
        return next(new Error('MCQ questions must have at least 2 options'));
    }
    
    if (this.type === 'single-correct' && Array.isArray(this.correctAnswer)) {
        return next(new Error('Single-correct questions can only have one correct answer'));
    }
    
    if (this.type === 'multiple-correct' && !Array.isArray(this.correctAnswer)) {
        return next(new Error('Multiple-correct questions must have array of correct answers'));
    }
    
    next();
});

QuestionSchema.virtual('difficultyLevel').get(function() {
    const levels = { easy: 1, medium: 2, hard: 3 };
    return levels[this.difficulty];
});

QuestionSchema.methods.checkAnswer = function(studentAnswer) {
    if (this.type === 'single-correct' || this.type === 'true-false') {
        return studentAnswer === this.correctAnswer;
    }
    
    if (this.type === 'multiple-correct') {
        if (!Array.isArray(studentAnswer)) return false;
        
        const correct = Array.isArray(this.correctAnswer) ? this.correctAnswer : [this.correctAnswer];
        const student = studentAnswer.sort();
        const correctSorted = correct.sort();
        
        return JSON.stringify(student) === JSON.stringify(correctSorted);
    }
    
    return false;
};

QuestionSchema.methods.calculatePartialMarks = function(studentAnswer, partialMarkingEnabled = false) {
    if (!partialMarkingEnabled || this.type !== 'multiple-correct') {
        return this.checkAnswer(studentAnswer) ? this.marks : 0;
    }
    
    if (!Array.isArray(studentAnswer) || studentAnswer.length === 0) return 0;
    
    const correctAnswers = Array.isArray(this.correctAnswer) ? this.correctAnswer : [this.correctAnswer];
    const correctCount = studentAnswer.filter(ans => correctAnswers.includes(ans)).length;
    const wrongCount = studentAnswer.filter(ans => !correctAnswers.includes(ans)).length;
    
    const score = Math.max(0, (correctCount - wrongCount) / correctAnswers.length * this.marks);
    return Math.round(score * 100) / 100; 
};

export const Question = mongoose.model('Question', QuestionSchema);
