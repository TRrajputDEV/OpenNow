// models/exam.model.js
import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        index: true
    },
    instructions: {
        type: String,
        trim: true,
        default: 'Read all questions carefully before answering. Once submitted, answers cannot be changed.'
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Exam duration is required'],
        min: [5, 'Duration must be at least 5 minutes'],
        max: [300, 'Duration cannot exceed 300 minutes']
    },
    totalMarks: {
        type: Number,
        required: false,
        min: 0
    },
    passingMarks: {
        type: Number,
        required: true,
        min: 0
    },
    questions: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        marks: {
            type: Number,
            required: true,
            min: 0
        },
        order: {
            type: Number,
            required: true
        }
    }],
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        shuffleQuestions: {
            type: Boolean,
            default: false
        },
        showResultsImmediately: {
            type: Boolean,
            default: true
        },
        allowReview: {
            type: Boolean,
            default: true
        },
        partialMarking: {
            type: Boolean,
            default: false
        },
        negativeMarking: {
            type: Boolean,
            default: false
        },
        negativeMarkingValue: {
            type: Number,
            default: 0
        }
    },
    allowedStudents: {
        type: String,
        enum: ['all', 'specific'],
        default: 'all'
    },
    specificStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ExamSchema.index({ createdBy: 1, isActive: 1 });
ExamSchema.index({ subject: 1, isPublished: 1 });
ExamSchema.index({ startTime: 1, endTime: 1 });
ExamSchema.index({ isPublished: 1, isActive: 1 });

// Virtual for question count
ExamSchema.virtual('questionCount').get(function() {
    return this.questions.length;
});

// Virtual for exam status
ExamSchema.virtual('status').get(function() {
    const now = new Date();
    
    if (!this.isPublished) return 'draft';
    if (now < this.startTime) return 'scheduled';
    if (now > this.endTime) return 'completed';
    return 'active';
});

// Validation: End time must be after start time
ExamSchema.pre('save', function(next) {
    if (this.endTime <= this.startTime) {
        return next(new Error('End time must be after start time'));
    }
    
    if (this.passingMarks > this.totalMarks) {
        return next(new Error('Passing marks cannot exceed total marks'));
    }
    
    // Calculate total marks from questions
    if (this.questions && this.questions.length > 0) {
        this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
    }
    
    next();
});

// Method to check if exam is currently active
ExamSchema.methods.isCurrentlyActive = function() {
    const now = new Date();
    return this.isPublished && now >= this.startTime && now <= this.endTime;
};

// Method to check if student can attempt
ExamSchema.methods.canStudentAttempt = function(studentId) {
    if (!this.isPublished || !this.isActive) return false;
    if (!this.isCurrentlyActive()) return false;
    
    if (this.allowedStudents === 'all') return true;
    
    return this.specificStudents.some(id => id.toString() === studentId.toString());
};

export const Exam = mongoose.model('Exam', ExamSchema);
