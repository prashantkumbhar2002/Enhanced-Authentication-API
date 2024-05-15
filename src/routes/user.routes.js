import { Router } from "express";
import {
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/currentUser").get(verifyJWT, getCurrentUser);
router.route("/updateAccount").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);


export default router;