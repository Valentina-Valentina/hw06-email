import express from "express";

import authController from "../../controllers/auth-controller.js";

import { authenticate, upload } from "../../middlewares/index.js";

import {validateBody} from "../../decorators/index.js";

import { userSignupSchema, userSigninSchema, userSubscriptionSchema } from "../../models/User.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(userSignupSchema), authController.signup);

authRouter.post("/login", validateBody(userSigninSchema), authController.signin);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);

authRouter.patch("/", authenticate, validateBody(userSubscriptionSchema), authController.subscribe);

authRouter.patch("/avatars", authenticate, upload.single("avatar"), authController.avatar);

export default authRouter;