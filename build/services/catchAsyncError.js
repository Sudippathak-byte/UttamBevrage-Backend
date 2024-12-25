"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (fn) => {
    return (req, res) => {
        fn(req, res).catch((err) => {
            return res.status(500).json({
                messsage: "Internal Error",
                errorMessage: err.message,
            });
        });
    };
};
exports.default = errorHandler;
