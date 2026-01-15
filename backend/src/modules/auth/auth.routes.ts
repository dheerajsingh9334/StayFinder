import { Router } from "express";
import AuthController from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/refreshToken", AuthController.refreshToken);
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", authMiddleware, AuthController.getProfile);
authRouter.patch(
  "/updateProfile",
  authMiddleware,
  AuthController.updateProfile
);
authRouter.patch("/password", authMiddleware, AuthController.changePassword);

export default authRouter;
