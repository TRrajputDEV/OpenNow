import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Exam } from '../models/exam.model.js';
import { Question } from '../models/question.model.js';



/**
 * @desc    Create new exam
 * @route   POST /api/v1/exams
 * @access  Private (Teacher/Admin)
 */
export const createExam = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        subject,
        instructions,
        duration,
        passingMarks,
        questions,
        startTime,
        endTime,
        settings,
        allowedStudents,
        specificStudents,
        category
    } = req.body;

   
    if (!title || !subject || !duration || !startTime || !endTime) {
        throw new ApiError(400, "Title, subject, duration, start time, and end time are required");
    }

    if (!questions || questions.length === 0) {
        throw new ApiError(400, "At least one question is required");
    }

  
    const questionIds = questions.map(q => q.questionId || q.question);
    const existingQuestions = await Question.find({
        _id: { $in: questionIds },
        isActive: true
    });

    if (existingQuestions.length !== questionIds.length) {
        throw new ApiError(400, "One or more questions are invalid or inactive");
    }

   
    const formattedQuestions = questions.map((q, index) => ({
        question: q.questionId || q.question,
        marks: q.marks || 1,
        order: q.order || index + 1
    }));

 
    const exam = await Exam.create({
        title,
        description,
        subject,
        instructions,
        duration,
        passingMarks: passingMarks || 0,
        questions: formattedQuestions,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        settings: settings || {},
        allowedStudents: allowedStudents || 'all',
        specificStudents: specificStudents || [],
        category,
        createdBy: req.user._id
    });

    const populatedExam = await Exam.findById(exam._id)
        .populate('questions.question', 'questionText type difficulty marks')
        .populate('createdBy', 'username email');

    return res.status(201).json(
        new ApiResponse(201, populatedExam, "Exam created successfully")
    );
});



/**
 * @desc    Get all exams (Teacher sees own, Student sees available)
 * @route   GET /api/v1/exams
 * @access  Private
 */
export const getExams = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { isActive: true };

   
    if (req.user.role === 'teacher') {
        query.createdBy = req.user._id;
    } else if (req.user.role === 'student') {
       
        query.isPublished = true;
        query.$or = [
            { allowedStudents: 'all' },
            { specificStudents: req.user._id }
        ];
    }

    if (req.query.subject) {
        query.subject = req.query.subject;
    }

    if (req.query.isPublished !== undefined) {
        query.isPublished = req.query.isPublished === 'true';
    }

    if (req.query.status) {
        const now = new Date();
        if (req.query.status === 'scheduled') {
            query.startTime = { $gt: now };
            query.isPublished = true;
        } else if (req.query.status === 'active') {
            query.startTime = { $lte: now };
            query.endTime = { $gte: now };
            query.isPublished = true;
        } else if (req.query.status === 'completed') {
            query.endTime = { $lt: now };
        } else if (req.query.status === 'draft') {
            query.isPublished = false;
        }
    }

    if (req.query.search) {
        query.title = { $regex: req.query.search, $options: 'i' };
    }

    const exams = await Exam.find(query)
        .populate('createdBy', 'username email')
        .populate('questions.question', 'questionText type difficulty')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await Exam.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                exams,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            "Exams fetched successfully"
        )
    );
});

/**
 * @desc    Get single exam by ID
 * @route   GET /api/v1/exams/:id
 * @access  Private
 */
export const getExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id)
        .populate('createdBy', 'username email')
        .populate('questions.question');

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    if (req.user.role === 'teacher' && exam.createdBy._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to view this exam");
    }

    if (req.user.role === 'student') {
        if (!exam.isPublished || !exam.canStudentAttempt(req.user._id)) {
            throw new ApiError(403, "You are not allowed to view this exam");
        }
    }

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam fetched successfully")
    );
});


/**
 * @desc    Update exam
 * @route   PUT /api/v1/exams/:id
 * @access  Private (Teacher/Admin - own exams only)
 */
export const updateExam = asyncHandler(async (req, res) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this exam");
    }

    if (exam.isPublished && new Date() >= exam.startTime) {
        throw new ApiError(400, "Cannot update exam that has already started");
    }

    if (req.body.questions) {
        const questionIds = req.body.questions.map(q => q.questionId || q.question);
        const existingQuestions = await Question.find({
            _id: { $in: questionIds },
            isActive: true
        });

        if (existingQuestions.length !== questionIds.length) {
            throw new ApiError(400, "One or more questions are invalid or inactive");
        }

        req.body.questions = req.body.questions.map((q, index) => ({
            question: q.questionId || q.question,
            marks: q.marks || 1,
            order: q.order || index + 1
        }));
    }

    const allowedFields = [
        'title', 'description', 'subject', 'instructions', 'duration', 
        'passingMarks', 'questions', 'startTime', 'endTime', 'settings',
        'allowedStudents', 'specificStudents', 'category'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    exam = await Exam.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    )
    .populate('questions.question', 'questionText type difficulty marks')
    .populate('createdBy', 'username email');

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam updated successfully")
    );
});


/**
 * @desc    Publish exam
 * @route   PATCH /api/v1/exams/:id/publish
 * @access  Private (Teacher/Admin)
 */
export const publishExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to publish this exam");
    }

    if (exam.questions.length === 0) {
        throw new ApiError(400, "Cannot publish exam without questions");
    }

    exam.isPublished = true;
    await exam.save();

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam published successfully")
    );
});

/**
 * @desc    Unpublish exam
 * @route   PATCH /api/v1/exams/:id/unpublish
 * @access  Private (Teacher/Admin)
 */
export const unpublishExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to unpublish this exam");
    }

    if (new Date() >= exam.startTime) {
        throw new ApiError(400, "Cannot unpublish exam that has already started");
    }

    exam.isPublished = false;
    await exam.save();

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam unpublished successfully")
    );
});


/**
 * @desc    Delete exam (soft delete)
 * @route   DELETE /api/v1/exams/:id
 * @access  Private (Teacher/Admin - own exams only)
 */
export const deleteExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this exam");
    }

    if (exam.isPublished && new Date() >= exam.startTime) {
        throw new ApiError(400, "Cannot delete exam that has already started");
    }

    exam.isActive = false;
    await exam.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Exam deleted successfully")
    );
});


/**
 * @desc    Get exam statistics
 * @route   GET /api/v1/exams/stats/overview
 * @access  Private (Teacher/Admin)
 */
export const getExamStats = asyncHandler(async (req, res) => {
    const query = req.user.role === 'teacher' 
        ? { createdBy: req.user._id, isActive: true }
        : { isActive: true };

    const now = new Date();

    const total = await Exam.countDocuments(query);
    const published = await Exam.countDocuments({ ...query, isPublished: true });
    const draft = await Exam.countDocuments({ ...query, isPublished: false });
    
    const active = await Exam.countDocuments({
        ...query,
        isPublished: true,
        startTime: { $lte: now },
        endTime: { $gte: now }
    });

    const scheduled = await Exam.countDocuments({
        ...query,
        isPublished: true,
        startTime: { $gt: now }
    });

    const completed = await Exam.countDocuments({
        ...query,
        endTime: { $lt: now }
    });

    const bySubject = await Exam.aggregate([
        { $match: query },
        { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                total,
                published,
                draft,
                active,
                scheduled,
                completed,
                bySubject
            },
            "Exam statistics fetched successfully"
        )
    );
});
