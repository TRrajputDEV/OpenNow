// controllers/user.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate access and refresh tokens for a user
 */
const generateAccessAndRefreshTokens = async (user) => {
    try {
        // ✅ Accept user object instead of re-fetching
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        // ✅ Now we save both lastLogin AND refreshToken in ONE operation
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate authentication tokens");
    }
};


// ==================== AUTHENTICATION CONTROLLERS ====================

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role, institution, phone, rollNumber, class: userClass, section } = req.body;

    // Validation
    if (!username || !email || !password) {
        throw new ApiError(400, "Username, email, and password are required");
    }

    if ([username, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "Fields cannot be empty");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // Create user object
    const userData = {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        role: role || 'student',
    };

    // Add optional fields if provided
    if (institution) userData.institution = institution;
    if (phone) userData.phone = phone;
    if (rollNumber) userData.rollNumber = rollNumber;
    if (userClass) userData.class = userClass;
    if (section) userData.section = section;

    // Create user
    const user = await User.create(userData);

    // Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Validation
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // Find user and explicitly select password field
    const user = await User.findOne({
        $or: [{ email }, { username }]
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Check if user is active
    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated. Please contact support");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // ✅ FIX: Update last login FIRST on the current user object
    user.lastLogin = new Date();
    // Don't save yet - we'll do it together with refreshToken

    // ✅ Modified: Pass the user object instead of just ID
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    // Get user without sensitive fields
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
    // Clear refresh token from database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id).select("+refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // ✅ ADD: Check if user is active
        if (!user.isActive) {
            throw new ApiError(403, "Account is deactivated");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or has been used");
        }

        // ✅ OPTIMIZATION: Pass user object instead of re-fetching
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});


// ==================== USER PROFILE CONTROLLERS ====================

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, institution, phone, bio, preferences } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (institution) updateData.institution = institution;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (preferences) updateData.preferences = preferences;

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

/**
 * @desc    Change user password
 * @route   POST /api/v1/users/change-password
 * @access  Private
 */
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    // Find user with password field
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ==================== ADMIN USER MANAGEMENT ====================

/**
 * @desc    Get all users (with pagination, filtering, search)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = {};

    if (req.query.role) {
        query.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
        query.isActive = req.query.isActive === 'true';
    }

    if (req.query.isEmailVerified !== undefined) {
        query.isEmailVerified = req.query.isEmailVerified === 'true';
    }

    if (req.query.search) {
        query.$or = [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { institution: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Execute query
    const users = await User.find(query)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            "Users fetched successfully"
        )
    );
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Users can only view their own profile unless they're admin/teacher
    if (
        req.user.role !== 'admin' &&
        req.user.role !== 'teacher' &&
        req.user._id.toString() !== req.params.id
    ) {
        throw new ApiError(403, "Not authorized to view this profile");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
    const { role, isActive, isEmailVerified } = req.body;

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User updated successfully"));
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
        throw new ApiError(403, "Cannot delete admin accounts");
    }

    await user.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private/Admin
 */
export const getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                total: totalUsers,
                active: activeUsers,
                verified: verifiedUsers,
                byRole: stats
            },
            "User statistics fetched successfully"
        )
    );
});
