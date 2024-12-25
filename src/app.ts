import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import "./database/connection";
import adminseeder from "./adminSeeder";
import categoryController from "./controllers/categoryController";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import categoryRoute from "./routes/categoryRoute";
import cartRoute from "./routes/cartRoute";
import orderRoute from "./routes/orderRoute";
import chatRoute from "./routes/chatRoute"; // Import chat route
import User from "./database/models/User";
import Chat from "./database/models/Chat";
import Product from "./database/models/Product";
import { Op } from "sequelize";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: "*",
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

// Test endpoint to verify server is working
app.get("/test", (req: Request, res: Response) => {
  res.send("Server is working!");
});

// Run cron job every 10 minutes
cron.schedule("*/10 * * * *", () => {
  console.log("Task running every 10 minutes");
});

// Seed admin credentials
adminseeder();

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("success");
});

app.use("", userRoute);
app.use("/admin/product", productRoute);
app.use("/admin/category", categoryRoute);
app.use("/customer/cart", cartRoute);
app.use("/order", orderRoute);
app.use("/chat", chatRoute); // Add chat route

// Product recommendation endpoint
app.get("/recommendations/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    // Placeholder functions for user history and top-selling products
    const getUserHistory = async (userId: string) => {
      // Implement your logic here
      return [];
    };
    const getTopSellingProducts = async () => {
      // Implement your logic here
      return [];
    };

    const userHistory = await getUserHistory(userId);
    const topSellingProducts = await getTopSellingProducts();

    // Combine and filter recommendations
    const recommendations = [...userHistory, ...topSellingProducts];
    res.status(200).json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Advanced filtering endpoint
app.get("/products", async (req: Request, res: Response) => {
  const { sort, categoryId, priceRange } = req.query;
  try {
    const filters: any = {};

    if (categoryId) {
      filters.categoryId = categoryId;
    }
    if (priceRange) {
      const [min, max] = (priceRange as string).split("-");
      filters.productPrice = { [Op.between]: [Number(min), Number(max)] };
    }

    const products = await Product.findAll({
      where: filters,
      order: sort ? [[sort as string, 'ASC']] : [],
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  categoryController.seedCategory();
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO Server
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let onlineUsers: any = [];

const addToOnlineUsers = (socketId: string, userId: string, role: string) => {
  onlineUsers = onlineUsers.filter((user: any) => user.userId !== userId);
  onlineUsers.push({ socketId, userId, role });
};

io.on("connection", async (socket) => {
  console.log("A client connected");

  const token = socket.handshake.query.token as string; // Get token from query parameters
  console.log("Received Token:", token);

  if (token) {
    try {
      if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not defined in environment variables");
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload & { id: string };
      console.log("Decoded Token:", decoded);
      const doesUserExists = await User.findByPk(decoded.id);
      console.log("User Exists:", doesUserExists);

      if (doesUserExists) {
        addToOnlineUsers(socket.id, doesUserExists.id, doesUserExists.role);
        console.log("User added to online users:", onlineUsers);

        // Handle real-time messaging
        socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
          const sender = await User.findByPk(senderId);
          const receiver = await User.findByPk(receiverId);

          if (!sender || !receiver) {
            console.error("Sender or receiver not found");
            return;
          }

          if ((sender.role === "customer" && receiver.role !== "admin") || 
              (sender.role === "admin" && receiver.role !== "customer")) {
            console.error("Unauthorized chat attempt");
            return;
          }

          io.to(receiverId).emit("receiveMessage", {
            senderId,
            message,
          });

          // Save message to database
          await Chat.create({ senderId, receiverId, message });

          // Emit notification event
          io.to(receiverId).emit("notification", {
            type: "new_message",
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

              // Emit notification event for default admin message
              io.to(senderId).emit("notification", {
                type: "new_message",
                senderId: receiverId,
                message: defaultAdminMessage,
              });
            }
          }
        });
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  } else {
    console.error("Token is missing in the query parameters");
  }

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });

  socket.on("updatedOrderStatus", ({ status, orderId, userId }) => {
    const findUser = onlineUsers.find((user: any) => user.userId == userId);
    if (findUser) {
      io.to(findUser.socketId).emit("statusUpdated", { status, orderId });

      // Emit notification event for order status update
      io.to(findUser.socketId).emit("notification", {
        type: "order_status_update",
        status,
        orderId,
      });
    }
  });

  socket.on("updatedPaymentStatus", ({ paymentStatus, orderId, userId }) => {
    const findUser = onlineUsers.find((user: any) => user.userId == userId);
    if (findUser) {
      io.to(findUser.socketId).emit("paymentStatusUpdated", {
        paymentStatus,
        orderId,
      });

      // Emit notification event for payment status update
      io.to(findUser.socketId).emit("notification", {
        type: "payment_status_update",
        paymentStatus,
        orderId,
      });
    } else {
      console.log(`User with ID ${userId} not found in onlineUsers`);
    }
  });

  console.log(onlineUsers);
});
