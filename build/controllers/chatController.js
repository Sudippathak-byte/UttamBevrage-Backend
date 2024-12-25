"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChatMessage_1 = __importDefault(require("../database/models/ChatMessage"));
class ChatController {
    getChatMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const messages = yield ChatMessage_1.default.findAll({
                where: { userId },
                order: [["createdAt", "ASC"]],
            });
            res.status(200).json({ messages });
        });
    }
    saveChatMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, message, role } = req.body;
            const chatMessage = yield ChatMessage_1.default.create({ userId, message, role });
            res.status(200).json({ chatMessage });
        });
    }
}
exports.default = new ChatController();
