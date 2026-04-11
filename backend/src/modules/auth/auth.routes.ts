import { Router } from "express";
import AuthController from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";
import passport from "passport";

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);

authRouter.post("/otp/send", AuthController.sendOtp);
authRouter.post("/otp/verify", AuthController.verifyOtp);
authRouter.post("/refreshToken", AuthController.refreshToken);
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", authMiddleware, AuthController.getProfile);
authRouter.patch(
  "/updateProfile",
  authMiddleware,
  AuthController.updateProfile,
);

authRouter.patch("/password", authMiddleware, AuthController.changePassword);
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  AuthController.googleCallback,
);
export default authRouter;
