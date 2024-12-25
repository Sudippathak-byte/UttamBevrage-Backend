import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import { promisify } from "util";
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
import User from "./database/models/User";
import ChatMessage from "./database/models/ChatMessage";
import chatRoute from "./routes/chatRoute";

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: "*",
  })
);

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
app.use(chatRoute); 

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  categoryController.seedCategory();
  console.log(`Server running on port ${PORT}`);
});

// WebSocket Server
const io = new Server(server, {
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

  const { token } = socket.handshake.auth;
  console.log(token);

  if (token) {
    try {
      //@ts-ignore
      const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
      //@ts-ignore
      const doesUserExists = await User.findByPk(decoded.id);

      if (doesUserExists) {
        addToOnlineUsers(socket.id, doesUserExists.id, doesUserExists.role);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }

  socket.on("sendMessage", async (data) => {
    const { userId, message, role } = data;

    // Save the chat message to the database
    await ChatMessage.create({ userId, message, role });

    // Auto-response from admin for new customer messages
    if (role === "customer") {
      socket.emit("receiveMessage", {
        userId: "admin",
        message: "Hi there, just wait for a moment until the admin doesn't see your message.",
        role: "admin",
      });
    }

    // Emit the message to the other user
    socket.broadcast.emit("receiveMessage", {
      userId,
      message,
      role,
    });
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });

  socket.on("updatedOrderStatus", ({ status, orderId, userId }) => {
    const findUser = onlineUsers.find((user: any) => user.userId == userId);
    if (findUser) {
      io.to(findUser.socketId).emit("statusUpdated", { status, orderId });
    }
  });

  socket.on("updatedPaymentStatus", ({ paymentStatus, orderId, userId }) => {
    const findUser = onlineUsers.find((user: any) => user.userId == userId);
    if (findUser) {
      io.to(findUser.socketId).emit("paymentStatusUpdated", {
        paymentStatus,
        orderId,
      });
    } else {
      console.log(`User with ID ${userId} not found in onlineUsers`);
    }
  });

  console.log(onlineUsers);
});
