import { Router } from "express";
import {
    changeCurrentPassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    registerAdmin,
    googleOAuthLogin
} from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-Token").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);

//very secured route
router.route("/register-admin/:userId").post(verifyJWT, registerAdmin);

router.route("/oauth/google").post(googleOAuthLogin);

export default router;