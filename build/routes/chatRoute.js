"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = __importDefault(require("../controllers/chatController"));
const router = express_1.default.Router();
router.get("/chat/:userId", chatController_1.default.getChatMessages);
router.post("/chat", chatController_1.default.saveChatMessage);
exports.default = router;
