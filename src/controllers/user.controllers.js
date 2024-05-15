import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/apiResponse.js";


const getCurrentUser = asyncHandler(async (req, res, next) => {
    try {
        return res
            .status(200)
            .json(new APIResponse(200, req.user, "User fetched Successfully"));
    } catch (error) {
        next(error)
    }
});

const updateAccountDetails = asyncHandler(async (req, res, next) => {
    const { name, bio, phone } = req.body;
    try {
        if (![name, phone, bio].every((field) => typeof field === 'string' && field.trim() !== "")) {
            throw new APIError(400, "All fields are Required!");
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    // fullName: fullName,
                    // email: email
                    name,
                    bio,
                    phone,
                },
            },
            { new: true }
        ).select("-password");
    
        return res
            .status(200)
            .json(new APIResponse(200, user, "Account details updated successfully"));
    } catch (error) {
        next(error)
    }
});

const updateAvatar = asyncHandler(async (req, res, next) => {
    const avatarOldCloudinaryURL = req.user?.avatar;
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar file is missing");
    }

    try {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log(`"New Image updated successfully on cloudinary, avatar URL is ${avatar.url}"`)
        if (!avatar.url) {
            throw new APIError(400, "Error while uploading Avatar");
        }
        if (avatar.url && avatarOldCloudinaryURL) {
            try {
                const deleteAvatar = await deleteFromCloudinary(avatarOldCloudinaryURL)
                console.log("deleteAvatar ::##::", deleteAvatar)
                if (!deleteAvatar) {
                    throw new APIError(500, "Old Avator image failed to delete from cloudinary")
                }
            }
            catch (error) {
                throw new APIError(501, "Old Avator image failed to delete from cloudinary error : ", error)
            }
        }
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url,
                },
            },
            { new: true }
        ).select("-password");
        return res
            .status(200)
            .json(new APIResponse(200, user, "Avatar image is updated successfully"));
    } catch (error) {
        next(error)
    }
});

const updateUserProfileVisibility = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
      
        // Toggle profile visibility (isPublic)
        user.isPublic = !user.isPublic;
        await user.save();
      
        res.status(200).json(new APIResponse(200, {isPublic: user.isPublic}, 'Profile visibility updated successfully'));
    } catch (error) {
        next(error)
    }
  });

const getUserProfile = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    try {
        const userProfile = await User.findById(userId);
        if (!userProfile.isPublic && !req.user.isAdmin) {
            throw new APIError(403, 'Unauthorized: Private profile access denied');
        }
        res.status(200).json(new APIResponse(200, userProfile, 'User profile retrieved successfully'));
    } catch (error) {
        next(error)
    }
});

const getAllUserProfiles = asyncHandler(async (req, res, next) => {
    try {
        const allUserProfiles = await User.find();
        res.status(200).json(new APIResponse(200, allUserProfiles, 'All user profiles retrieved successfully'));
    } catch (error) {
        next(error)
    }
});

export {
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateUserProfileVisibility,
    getUserProfile,
    getAllUserProfiles
};
