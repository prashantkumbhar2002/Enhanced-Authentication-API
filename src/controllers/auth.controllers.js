import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIError(
            500,
            "Something went wrong while generating access and refresh token."
        );
    }
};

const googleOAuthLogin = asyncHandler(async (req, res, next) => {
    try {
    //Assuming Oauth request is initiated from frontend and as it sends token to server 
      const { token } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const { email, name, picture } = payload;
  
      let user = await User.findOne({ email });
  
      if (!user) {
        // Register user if not exists
        user = new User({
          email,
          name,
          avatar: picture
        });
        await user.save();
      }
  
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
      res.status(200).json(new APIResponse(200, { accessToken, refreshToken }, 'User logged in via Google successfully'));
    } catch (error) {
      next(error);
    }
  });
  

const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, name, password, bio, phone } = req.body;
        if (![email, name, password, phone].every((field) => typeof field === 'string' && field.trim() !== "")) {
            throw new APIError(400, "All fields are Required!");
        }
        const existedUser = await User.findOne({ email: email });
        // console.log(" ~ ========================== existedUser:", existedUser);
        if (existedUser) {
            throw new APIError(409, "User with email already exist.");
        }
        // console.log(" ~ ========================== req.files:", req.files);
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // console.log(" ~ avatar Path :", avatarLocalPath)
        if (!avatarLocalPath) {
            throw new APIError(400, "Avatar is required.");
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new APIError(500, "Error while saving Avatar");
        }
        const user = await User.create({
            name: name,
            avatar: avatar.url,
            email,
            phone,
            bio,
            password,
        });
        const createdUser = await User.findOne(user._id).select(
            "-password -refreshToken"
        );
        if (!createdUser) {
            throw new APIError(500, "Error while registering the user.");
        }
        return res
            .status(201)
            .json(new APIResponse(200, createdUser, "User Created Successfully"));
    } catch (error) {
        next(error)
    }
});


const registerAdmin = asyncHandler(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
  
      if (!user) {
        throw new APIError(404, 'User not found');
      }
  
      //  only allow admin to promote users -- considering current user as Admin (pre-registered)
      if (!req.user.isAdmin) {
        throw new APIError(403, 'Unauthorized');
      }
  
      user.isAdmin = true;
      await user.save();
  
      return res.status(200).json(new APIResponse(200, user, 'User registered as admin successfully'));
    } catch (error) {
      next(error);
    }
  });
  

const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            throw new APIError(400, "Email is required..");
        }
        if(!password){
            throw new APIError(400, "Password is required..");
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new APIError(404, "User not found with this email");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new APIError(401, "Invalid user credentials.");
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
            user._id
        );
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "User logged-in Successfully"
                )
            );
    } catch (error) {
        next(error)
    }
    
});

const logoutUser = asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                // $set: {
                //   refreshToken: undefined,
                // },
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true,
            }
        );
    
        const options = {
            httpOnly: true,
            secure: true,
        };
    
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new APIResponse(200, {}, "User Logged Out Successfully"));
    } catch (error) {
        next(error)
    }
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new APIError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        // console.log(user);
        if (!user) {
            throw new APIError(401, "Invalid Refresh Token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401, "Refresh Token is expires or used.");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
            user._id
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        next(error)
    }
});

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user?._id);
    
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    
        if (!isPasswordCorrect) {
            throw new APIError(400, "Invalid Password");
        }
    
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
    
        return res
            .status(200)
            .json(new APIResponse(200, {}, "Password Updated successfully"));
    } catch (error) {
        next(error)
    }
});




export {
    registerUser,
    registerAdmin,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    googleOAuthLogin
};
