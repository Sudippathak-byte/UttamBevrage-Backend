import { Request, Response } from "express";
import ChatMessage from "../database/models/ChatMessage";

class ChatController {
  async getChatMessages(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const messages = await ChatMessage.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json({ messages });
  }

  async saveChatMessage(req: Request, res: Response): Promise<void> {
    const { userId, message, role } = req.body;
    const chatMessage = await ChatMessage.create({ userId, message, role });
    res.status(200).json({ chatMessage });
  }
}

export default new ChatController();
