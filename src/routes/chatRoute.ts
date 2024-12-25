import express, { Router } from "express";
import chatController from "../controllers/chatController";

const router: Router = express.Router();

router.get("/chat/:userId", chatController.getChatMessages);
router.post("/chat", chatController.saveChatMessage);

export default router;
