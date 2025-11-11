import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [50, 'Username cannot be longer than 50 characters'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // ✅ Critical security fix
    },
    refreshToken: {
        type: String,
        select: false 
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    institution: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        sparse: true  
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: false },
            sms: { type: Boolean, default: false },
            examReminders: { type: Boolean, default: true },
            gradeUpdates: { type: Boolean, default: true },
            systemUpdates: { type: Boolean, default: false }
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    // Teacher-specific fields
    subjects: [{
        type: String,
        trim: true
    }],
    sections: [{
        name: { type: String, required: true },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now }
    }],
    // Student-specific fields
    rollNumber: {
        type: String,
        trim: true,
        sparse: true  
    },
    class: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ✅ Compound index for common queries
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ email: 1 });  // ✅ Optimize login queries

// Virtual for fullname
UserSchema.virtual('fullname').get(function() {
    return this.username;
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.isPasswordCorrect = async function(password) {
    if (!this.password) {
        throw new Error('Password not selected. Use .select("+password")');
    }
    return await bcrypt.compare(password, this.password);
};


// ✅ Generate Access Token with role for authorization
UserSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role  // ✅ Added role for middleware checks
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'  // ✅ Default fallback
        }
    );
};

// ✅ Fixed typo: refreshAcessToken → generateRefreshToken
UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'  // ✅ Default fallback
        }
    );
};

// Update last login
UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model('User', UserSchema);
