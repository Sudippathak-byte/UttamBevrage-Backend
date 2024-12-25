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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../database/models/User"));
class AuthController {
    static registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, username, password, bestSports, bestActor, idol } = req.body;
            if (!email || !username || !password || !bestSports || !bestActor || !idol) {
                res.status(400).json({
                    message: "Please provide all required fields",
                });
                return;
            }
            const existingUser = yield User_1.default.findOne({ where: { email } });
            if (existingUser) {
                res.status(400).json({
                    message: "User with this email already exists",
                });
                return;
            }
            const hashedPassword = bcrypt_1.default.hashSync(password, 12);
            const newUser = yield User_1.default.create({
                email,
                username,
                password: hashedPassword,
                role: "customer",
                bestSports,
                bestActor,
                idol,
            });
            const token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.SECRET_KEY, {
                expiresIn: "1h",
            });
            res.status(201).json({
                message: "User registered successfully",
                token,
            });
        });
    }
    static loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    message: "Please provide email and password",
                });
                return;
            }
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }
            const isPasswordValid = bcrypt_1.default.compareSync(password, user.password);
            if (!isPasswordValid) {
                res.status(403).json({
                    message: "Invalid password",
                });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_KEY, {
                expiresIn: "1h",
            });
            res.status(200).json({
                message: "User logged in successfully",
                token,
            });
        });
    }
    static requestPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, bestSports, bestActor, idol } = req.body;
            if (!email || !bestSports || !bestActor || !idol) {
                res.status(400).json({
                    message: "Please provide email and answers to all security questions",
                });
                return;
            }
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({
                    message: "No user with that email",
                });
                return;
            }
            if (user.bestSports !== bestSports ||
                user.bestActor !== bestActor ||
                user.idol !== idol) {
                res.status(403).json({
                    message: "Security answers do not match",
                });
                return;
            }
            // Generate token for resetting password
            const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_KEY, {
                expiresIn: "1h",
            });
            res.status(200).json({
                message: "Security answers verified. Use this token to reset password.",
                token,
            });
        });
    }
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                res.status(400).json({
                    message: "Please provide token and new password",
                });
                return;
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
                const user = yield User_1.default.findByPk(decoded.id);
                if (!user) {
                    res.status(404).json({
                        message: "User not found",
                    });
                    return;
                }
                user.password = bcrypt_1.default.hashSync(newPassword, 12);
                yield user.save();
                res.status(200).json({
                    message: "Password reset successfully",
                });
            }
            catch (error) {
                res.status(400).json({
                    message: "Invalid or expired token",
                });
            }
        });
    }
    static verifySecurityQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, bestSports, bestActor, idol } = req.body;
            if (!email || !bestSports || !bestActor || !idol) {
                res.status(400).json({
                    message: "Please provide email and answers to all security questions",
                });
                return;
            }
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({
                    message: "No user with that email",
                });
                return;
            }
            if (user.bestSports !== bestSports ||
                user.bestActor !== bestActor ||
                user.idol !== idol) {
                res.status(403).json({
                    message: "Security answers do not match",
                });
                return;
            }
            res.status(200).json({
                message: "Security answers verified",
            });
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email, bestSports, bestActor, idol } = req.body;
            if (!id || !email || !bestSports || !bestActor || !idol) {
                res.status(400).json({
                    message: "Please provide id, email, and answers to all security questions",
                });
                return;
            }
            const user = yield User_1.default.findOne({ where: { id, email } });
            if (!user) {
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }
            if (user.bestSports !== bestSports ||
                user.bestActor !== bestActor ||
                user.idol !== idol) {
                res.status(403).json({
                    message: "Security answers do not match",
                });
                return;
            }
            yield user.destroy();
            res.status(200).json({
                message: "User deleted successfully",
            });
        });
    }
    static fetchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, bestSports, bestActor, idol } = req.body;
            if (!email || !bestSports || !bestActor || !idol) {
                res.status(400).json({
                    message: "Please provide email and answers to all security questions",
                });
                return;
            }
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }
            if (user.bestSports !== bestSports ||
                user.bestActor !== bestActor ||
                user.idol !== idol) {
                res.status(403).json({
                    message: "Security answers do not match",
                });
                return;
            }
            const users = yield User_1.default.findAll();
            res.status(200).json({
                message: "Users fetched successfully",
                data: users,
            });
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email, bestSports, bestActor, idol } = req.body;
            if (!id || !email || !bestSports || !bestActor || !idol) {
                res.status(400).json({
                    message: "Please provide id, email, and answers to all security questions",
                });
                return;
            }
            const user = yield User_1.default.findOne({ where: { id, email } });
            if (!user) {
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }
            if (user.bestSports !== bestSports ||
                user.bestActor !== bestActor ||
                user.idol !== idol) {
                res.status(403).json({
                    message: "Security answers do not match",
                });
                return;
            }
            // Update user details
            Object.assign(user, req.body);
            yield user.save();
            res.status(200).json({
                message: "User updated successfully",
                data: user,
            });
        });
    }
}
exports.default = AuthController;
