"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.multer = void 0;
const multer_1 = __importDefault(require("multer"));
exports.multer = multer_1.default;
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const allowedFileTypes = ["image/jpg", "image/png", "image/jpeg"];
        if (!allowedFileTypes.includes(file.mimetype)) {
            cb(new Error("This filetype is not accepted"));
            return;
        }
        cb(null, "./src/uploads");
    },
    filename: function (req, file, cb) {
        const sanitizedFileName = file.originalname.replace(/\s+/g, "_");
        cb(null, Date.now() + "-" + sanitizedFileName);
    },
});
exports.storage = storage;
