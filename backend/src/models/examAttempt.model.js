import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    selectedAnswer: {
        type: mongoose.Schema.Types.Mixed, 
        default: null
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    marksAwarded: {
        type: Number,
        default: 0,
        min: 0
    },
    maxMarks: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, 
        default: 0
    }
}, { _id: false });

const ExamAttemptSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    answers: [AnswerSchema],
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    submitTime: {
        type: Date
    },
    timeSpent: {
        type: Number, 
        default: 0
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted', 'auto-submitted', 'completed'],
        default: 'in-progress'
    },
    score: {
        type: Number,
        default: 0,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    passed: {
        type: Boolean,
        default: false
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        browserInfo: String,
        tabSwitches: {
            type: Number,
            default: 0
        },
        copyPasteAttempts: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ExamAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });
ExamAttemptSchema.index({ student: 1, status: 1 });
ExamAttemptSchema.index({ exam: 1, status: 1 });

ExamAttemptSchema.virtual('resultStatus').get(function() {
    if (this.status === 'in-progress') return 'pending';
    return this.passed ? 'pass' : 'fail';
});

ExamAttemptSchema.virtual('grade').get(function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
});

ExamAttemptSchema.pre('save', function(next) {
    if (this.status === 'submitted' || this.status === 'auto-submitted') {
      
        this.score = this.answers.reduce((sum, ans) => sum + ans.marksAwarded, 0);
  
        if (this.totalMarks > 0) {
            this.percentage = Math.round((this.score / this.totalMarks) * 100 * 100) / 100;
        }
        
        if (!this.submitTime) {
            this.submitTime = new Date();
        }
        
        if (this.startTime && this.submitTime) {
            this.timeSpent = Math.floor((this.submitTime - this.startTime) / 1000);
        }
    }
    
    next();
});
ExamAttemptSchema.methods.isValid = function(examEndTime) {
    const now = new Date();
    return this.status === 'in-progress' && now <= examEndTime;
};

ExamAttemptSchema.methods.autoSubmitIfExpired = function(examEndTime) {
    const now = new Date();
    if (this.status === 'in-progress' && now > examEndTime) {
        this.status = 'auto-submitted';
        this.submitTime = examEndTime;
        return true;
    }
    return false;
};

export const ExamAttempt = mongoose.model('ExamAttempt', ExamAttemptSchema);
