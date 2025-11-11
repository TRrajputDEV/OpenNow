// middleware/auth.middleware.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

/**
 * Verify JWT and attach user to request
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized - No access token provided");
        }

        // Verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (jwtError) {
            // Handle specific JWT errors
            if (jwtError.name === 'TokenExpiredError') {
                throw new ApiError(401, "Access token expired");
            }
            if (jwtError.name === 'JsonWebTokenError') {
                throw new ApiError(401, "Invalid access token");
            }
            throw new ApiError(401, "Token verification failed");
        }

        // Fetch user and exclude sensitive fields
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(401, "Invalid token - User not found");
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(403, "Account is deactivated");
        }

        // Attach user to request
        req.user = user;
        next();
        
    } catch (error) {
        // Preserve ApiError instances
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(401, error.message || "Authentication failed");
    }
});

/**
 * Role-based authorization middleware
 * Usage: authorize('admin', 'teacher')
 */
export const authorize = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403, 
                `Access denied. Required role: ${allowedRoles.join(' or ')}`
            );
        }

        next();
    });
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that show different content for logged-in users
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return next(); // Continue without user
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        
        if (user && user.isActive) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        // Silent fail - just continue without user
        next();
    }
});

/**
 * Check if user is email verified
 */
export const requireEmailVerification = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (!req.user.isEmailVerified) {
        throw new ApiError(403, "Email verification required");
    }

    next();
});

/**
 * Rate limiting check for exam routes
 * Prevents multiple concurrent exam attempts
 */
export const checkExamEligibility = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    // You can add logic here to check if user has active exam attempt
    // For now, just pass through
    next();
});
