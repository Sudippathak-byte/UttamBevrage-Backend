import express, { Router } from "express";
import errorHandler from "../services/catchAsyncError";
import authMiddleware, { Role } from "../middleware/authMiddleware";
import AuthController from "../controllers/userController";

const router: Router = express.Router();

router.route("/register").post(errorHandler(AuthController.registerUser));
router.route("/login").post(errorHandler(AuthController.loginUser));

// Added route for requesting password reset and resetting password
router
  .route("/request-password-reset")
  .post(errorHandler(AuthController.requestPasswordReset));

router.route("/reset-password").post(errorHandler(AuthController.resetPassword));

router
  .route("/verify-security-questions")
  .post(errorHandler(AuthController.verifySecurityQuestions));

// Updated delete and fetch user routes
router
  .route("/users")
  .post(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(AuthController.fetchUsers));

router
  .route("/user/:id")
  .delete(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(AuthController.deleteUser))
  .patch(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(AuthController.updateUser));

export default router;
