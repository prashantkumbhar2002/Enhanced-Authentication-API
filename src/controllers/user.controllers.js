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


export {
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
};
