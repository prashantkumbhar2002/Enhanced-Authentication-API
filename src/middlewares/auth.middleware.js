import { User } from "../models/user.models.js";
import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!accessToken){
            throw new APIError(401, "Unauthorized Request");
        }
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new APIError(401, "Invalid Access Token")
        }
        // console.log("User ============", user)
        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid Access Token");
    }
})

const authorizeAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user.isAdmin) {
        throw new APIError(403, 'Unauthorized: Admin access required');
    }
    next();
});


export { verifyJWT, authorizeAdmin };