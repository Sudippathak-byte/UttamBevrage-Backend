import express, { Router } from "express";
import ChatController from "../controllers/chatController";
import errorHandler from "../services/catchAsyncError";
import authMiddleware, { Role } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.post("/send", authMiddleware.isAuthenticated, errorHandler(ChatController.sendMessage));
router.get("/:userId/:chatPartnerId", authMiddleware.isAuthenticated, errorHandler(ChatController.getMessages));

export default router;
