// controllers/question.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Question } from '../models/question.model.js';

// ==================== CREATE QUESTION ====================

/**
 * @desc    Create new question (Teacher/Admin)
 * @route   POST /api/v1/questions
 * @access  Private (Teacher/Admin)
 */
export const createQuestion = asyncHandler(async (req, res) => {
    const {
        type,
        questionText,
        options,
        correctAnswer,
        marks,
        difficulty,
        category,
        subject,
        explanation,
        tags
    } = req.body;

    // Validation
    if (!type || !questionText || !correctAnswer || !category || !subject) {
        throw new ApiError(400, "Type, question text, correct answer, category, and subject are required");
    }

    // Create question
    const question = await Question.create({
        type,
        questionText,
        options: options || [],
        correctAnswer,
        marks: marks || 1,
        difficulty: difficulty || 'medium',
        category,
        subject,
        explanation,
        tags: tags || [],
        createdBy: req.user._id,
        source: 'manual'
    });

    return res.status(201).json(
        new ApiResponse(201, question, "Question created successfully")
    );
});

// ==================== GET QUESTIONS ====================

/**
 * @desc    Get all questions with filters (Teacher/Admin)
 * @route   GET /api/v1/questions
 * @access  Private (Teacher/Admin)
 */
export const getQuestions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = { isActive: true };

    // Filter by creator (teachers see only their questions, admins see all)
    if (req.user.role === 'teacher') {
        query.createdBy = req.user._id;
    }

    // Filters
    if (req.query.type) {
        query.type = req.query.type;
    }

    if (req.query.difficulty) {
        query.difficulty = req.query.difficulty;
    }

    if (req.query.category) {
        query.category = req.query.category;
    }

    if (req.query.subject) {
        query.subject = req.query.subject;
    }

    if (req.query.source) {
        query.source = req.query.source;
    }

    // Search by question text
    if (req.query.search) {
        query.questionText = { $regex: req.query.search, $options: 'i' };
    }

    // Execute query
    const questions = await Question.find(query)
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await Question.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                questions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            "Questions fetched successfully"
        )
    );
});

/**
 * @desc    Get single question by ID
 * @route   GET /api/v1/questions/:id
 * @access  Private (Teacher/Admin)
 */
export const getQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
        .populate('createdBy', 'username email');

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    // Teachers can only view their own questions (unless admin)
    if (req.user.role === 'teacher' && question.createdBy._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to view this question");
    }

    return res.status(200).json(
        new ApiResponse(200, question, "Question fetched successfully")
    );
});

// ==================== UPDATE QUESTION ====================

/**
 * @desc    Update question
 * @route   PUT /api/v1/questions/:id
 * @access  Private (Teacher/Admin - own questions only)
 */
export const updateQuestion = asyncHandler(async (req, res) => {
    let question = await Question.findById(req.params.id);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    // Teachers can only update their own questions
    if (req.user.role === 'teacher' && question.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this question");
    }

    // Update fields
    const updateData = {};
    const allowedFields = ['questionText', 'options', 'correctAnswer', 'marks', 'difficulty', 'category', 'subject', 'explanation', 'tags', 'isActive'];
    
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields to update");
    }

    question = await Question.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    return res.status(200).json(
        new ApiResponse(200, question, "Question updated successfully")
    );
});

// ==================== DELETE QUESTION ====================

/**
 * @desc    Delete question (soft delete)
 * @route   DELETE /api/v1/questions/:id
 * @access  Private (Teacher/Admin - own questions only)
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    // Teachers can only delete their own questions
    if (req.user.role === 'teacher' && question.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this question");
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Question deleted successfully")
    );
});

// ==================== BULK OPERATIONS ====================

/**
 * @desc    Get question statistics
 * @route   GET /api/v1/questions/stats
 * @access  Private (Teacher/Admin)
 */
export const getQuestionStats = asyncHandler(async (req, res) => {
    const query = req.user.role === 'teacher' 
        ? { createdBy: req.user._id, isActive: true }
        : { isActive: true };

    const stats = await Question.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                byType: {
                    $push: {
                        type: '$type',
                        count: 1
                    }
                },
                byDifficulty: {
                    $push: {
                        difficulty: '$difficulty',
                        count: 1
                    }
                },
                byCategory: {
                    $push: {
                        category: '$category',
                        count: 1
                    }
                }
            }
        }
    ]);

    const typeStats = await Question.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const difficultyStats = await Question.aggregate([
        { $match: query },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const categoryStats = await Question.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                total: stats[0]?.total || 0,
                byType: typeStats,
                byDifficulty: difficultyStats,
                byCategory: categoryStats
            },
            "Question statistics fetched successfully"
        )
    );
});

// export {
//     createQuestion,
//     getQuestions,
//     getQuestion,
//     updateQuestion,
//     deleteQuestion,
//     getQuestionStats
// };
