import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        
        const token = req.cookies?.accessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized - No access token provided");
        }

      
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (jwtError) {
           
            if (jwtError.name === 'TokenExpiredError') {
                throw new ApiError(401, "Access token expired");
            }
            if (jwtError.name === 'JsonWebTokenError') {
                throw new ApiError(401, "Invalid access token");
            }
            throw new ApiError(401, "Token verification failed");
        }

       
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(401, "Invalid token - User not found");
        }

       
        if (!user.isActive) {
            throw new ApiError(403, "Account is deactivated");
        }

 
        req.user = user;
        next();
        
    } catch (error) {
  
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(401, error.message || "Authentication failed");
    }
});

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

export const optionalAuth = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        
        if (user && user.isActive) {
            req.user = user;
        }
        
        next();
    } catch (error) {
 
        next();
    }
});

export const requireEmailVerification = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (!req.user.isEmailVerified) {
        throw new ApiError(403, "Email verification required");
    }

    next();
});


export const checkExamEligibility = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

   
    next();
});
