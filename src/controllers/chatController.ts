import { Request, Response } from "express";
import { Op } from "sequelize";
import Chat from "../database/models/Chat";
import User from "../database/models/User";
import { io } from "../app"; // Import io instance

class ChatController {
  public static async sendMessage(req: Request, res: Response) {
    const { senderId, receiverId, message } = req.body;

    // Ensure users exist and have the correct roles
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      res.status(404).json({ message: "Sender or receiver not found" });
      return;
    }

    if ((sender.role === "customer" && receiver.role !== "admin") || 
        (sender.role === "admin" && receiver.role !== "customer")) {
      res.status(403).json({ message: "Unauthorized chat attempt" });
      return;
    }

    const newMessage = await Chat.create({ senderId, receiverId, message });

    // Emit message to the receiver
    io.to(receiverId).emit("receiveMessage", {
      senderId,
      message,
    });

    // Check if this is the first message from the customer to the admin
    if (sender.role === "customer") {
      const chatHistory = await Chat.findAll({
        where: {
          [Op.or]: [
            { senderId: senderId, receiverId: receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
      });

      if (chatHistory.length === 1) { // This is the first message
        const defaultAdminMessage = "Your query will be responded to soon. Thank you for your query.";
        await Chat.create({ senderId: receiverId, receiverId: senderId, message: defaultAdminMessage });

        // Emit default admin message to the customer
        io.to(senderId).emit("receiveMessage", {
          senderId: receiverId,
          message: defaultAdminMessage,
        });
      }
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  }

  public static async getMessages(req: Request, res: Response) {
    const { userId, chatPartnerId } = req.params;

    const messages = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: chatPartnerId },
          { senderId: chatPartnerId, receiverId: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });
  }
}

export default ChatController;
