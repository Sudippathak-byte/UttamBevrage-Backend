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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const catchAsyncError_1 = __importDefault(require("../services/catchAsyncError"));
const authMiddleware_1 = __importStar(require("../middleware/authMiddleware"));
const userController_1 = __importDefault(require("../controllers/userController"));
const router = express_1.default.Router();
router.route("/register").post((0, catchAsyncError_1.default)(userController_1.default.registerUser));
router.route("/login").post((0, catchAsyncError_1.default)(userController_1.default.loginUser));
// Added route for requesting password reset and resetting password
router
    .route("/request-password-reset")
    .post((0, catchAsyncError_1.default)(userController_1.default.requestPasswordReset));
router.route("/reset-password").post((0, catchAsyncError_1.default)(userController_1.default.resetPassword));
router
    .route("/verify-security-questions")
    .post((0, catchAsyncError_1.default)(userController_1.default.verifySecurityQuestions));
// Updated delete and fetch user routes
router
    .route("/users")
    .post(authMiddleware_1.default.isAuthenticated, authMiddleware_1.default.restrictTo(authMiddleware_1.Role.Admin), (0, catchAsyncError_1.default)(userController_1.default.fetchUsers));
router
    .route("/user/:id")
    .delete(authMiddleware_1.default.isAuthenticated, authMiddleware_1.default.restrictTo(authMiddleware_1.Role.Admin), (0, catchAsyncError_1.default)(userController_1.default.deleteUser))
    .patch(authMiddleware_1.default.isAuthenticated, authMiddleware_1.default.restrictTo(authMiddleware_1.Role.Admin), (0, catchAsyncError_1.default)(userController_1.default.updateUser));
exports.default = router;
