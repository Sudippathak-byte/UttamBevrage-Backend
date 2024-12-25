"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_cron_1 = __importDefault(require("node-cron"));
require("./database/connection");
const adminSeeder_1 = __importDefault(require("./adminSeeder"));
const categoryController_1 = __importDefault(require("./controllers/categoryController"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const categoryRoute_1 = __importDefault(require("./routes/categoryRoute"));
const cartRoute_1 = __importDefault(require("./routes/cartRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const User_1 = __importDefault(require("./database/models/User"));
const ChatMessage_1 = __importDefault(require("./database/models/ChatMessage"));
const chatRoute_1 = __importDefault(require("./routes/chatRoute"));
// Load environment variables
dotenv.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "uploads")));
// Test endpoint to verify server is working
app.get("/test", (req, res) => {
    res.send("Server is working!");
});
// Run cron job every 10 minutes
node_cron_1.default.schedule("*/10 * * * *", () => {
    console.log("Task running every 10 minutes");
});
// Seed admin credentials
(0, adminSeeder_1.default)();
// Routes
app.get("/", (req, res) => {
    res.send("success");
});
app.use("", userRoute_1.default);
app.use("/admin/product", productRoute_1.default);
app.use("/admin/category", categoryRoute_1.default);
app.use("/customer/cart", cartRoute_1.default);
app.use("/order", orderRoute_1.default);
app.use(chatRoute_1.default);
// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    categoryController_1.default.seedCategory();
    console.log(`Server running on port ${PORT}`);
});
// Socket.IO Server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
let onlineUsers = [];
const addToOnlineUsers = (socketId, userId, role) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ socketId, userId, role });
};
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("A client connected");
    const token = socket.handshake.query.token; // Get token from query parameters
    console.log("Received Token:", token);
    if (token) {
        try {
            if (!process.env.SECRET_KEY) {
                throw new Error("SECRET_KEY is not defined in environment variables");
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            console.log("Decoded Token:", decoded);
            const doesUserExists = yield User_1.default.findByPk(decoded.id);
            console.log("User Exists:", doesUserExists);
            if (doesUserExists) {
                addToOnlineUsers(socket.id, doesUserExists.id, doesUserExists.role);
                console.log("User added to online users:", onlineUsers);
            }
            else {
                console.error("User not found");
            }
        }
        catch (error) {
            console.error("Token verification failed:", error);
        }
    }
    else {
        console.error("Token is missing in the query parameters");
    }
    socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, message, role } = data;
        // Save the chat message to the database
        yield ChatMessage_1.default.create({ userId, message, role });
        console.log("Message saved:", { userId, message, role });
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
    }));
    socket.on("disconnect", () => {
        console.log("A client disconnected");
    });
    socket.on("updatedOrderStatus", ({ status, orderId, userId }) => {
        const findUser = onlineUsers.find((user) => user.userId == userId);
        if (findUser) {
            io.to(findUser.socketId).emit("statusUpdated", { status, orderId });
        }
    });
    socket.on("updatedPaymentStatus", ({ paymentStatus, orderId, userId }) => {
        const findUser = onlineUsers.find((user) => user.userId == userId);
        if (findUser) {
            io.to(findUser.socketId).emit("paymentStatusUpdated", {
                paymentStatus,
                orderId,
            });
        }
        else {
            console.log(`User with ID ${userId} not found in onlineUsers`);
        }
    });
    console.log(onlineUsers);
}));
