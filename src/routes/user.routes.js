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

router.route("/currentUser").get(verifyJWT, getCurrentUser);
router.route("/updateAccount").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route('/profile/visibility').put(verifyJWT, updateUserProfileVisibility);
router.route('/profile/:userId').get(verifyJWT, getUserProfile);
router.route('/profiles').get(verifyJWT, authorizeAdmin, getAllUserProfiles);
export default router;