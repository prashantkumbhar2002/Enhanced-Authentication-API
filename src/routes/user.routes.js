import { Router } from "express";
import {
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateUserProfileVisibility,
    getUserProfile,
    getAllUserProfiles
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *         phone:
 *           type: string
 *         email: 
 *           type: string
 *         avatar:
 *           type: string
 *         isPublic:
 *           type: boolean
 *         isAdmin: 
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt: 
 *           type: string
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */
/**
 * @swagger
 * components:
 *   schemas:     
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     EmptyResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */
/**
 * @swagger
 * /api/v1/users/currentUser:
 *   get:
 *     summary: Get current user details
 *     description: Retrieve details of the currently authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.route("/currentUser").get(verifyJWT, getCurrentUser);
/**
 * @swagger
 * /api/v1/users/updateAccount:
 *   patch:
 *     summary: Update user account details
 *     description: Update the name, bio, and phone number of the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Account details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.route("/updateAccount").patch(verifyJWT, updateAccountDetails);
/**
 * @swagger
 * /api/v1/users/avatar:
 *   patch:
 *     summary: Update user Photo
 *     description: Update the photo/image of the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Avatar image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
/**
 * @swagger
 * /api/v1/users/profile/visibility:
 *   put:
 *     summary: Toggle user profile visibility
 *     description: Toggle the visibility (public/private) of the authenticated user's profile.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profile visibility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isPublic:
 *                   type: boolean
 */
router.route('/profile/visibility').put(verifyJWT, updateUserProfileVisibility);
/**
 * @swagger
 * /api/v1/users/profile/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieve the profile of a user by their ID.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve profile for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.route('/profile/:userId').get(verifyJWT, getUserProfile);
/**
 * @swagger
 * /api/v1/users/profiles:
 *   get:
 *     summary: Get all user profiles
 *     description: Retrieve profiles of all users (admin only).
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All user profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.route('/profiles').get(verifyJWT, authorizeAdmin, getAllUserProfiles);
export default router;