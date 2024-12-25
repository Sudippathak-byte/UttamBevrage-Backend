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
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv = __importStar(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const Category_1 = __importDefault(require("./models/Category"));
const Cart_1 = __importDefault(require("./models/Cart"));
const Order_1 = __importDefault(require("./models/Order"));
const Payment_1 = __importDefault(require("./models/Payment"));
const Product_1 = __importDefault(require("./models/Product"));
const OrderDetails_1 = __importDefault(require("./models/OrderDetails"));
const Review_1 = __importDefault(require("./models/Review"));
dotenv.config();
const sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    dialect: "mysql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    models: [User_1.default, Category_1.default, Cart_1.default, Order_1.default, Payment_1.default, Product_1.default, OrderDetails_1.default, Review_1.default],
    logging: console.log,
});
sequelize
    .authenticate()
    .then(() => {
    console.log("connected");
})
    .catch((err) => {
    console.log(err);
});
sequelize.sync({ alter: false, force: false }).then(() => {
    console.log("Tables synced!");
});
// Relationships
User_1.default.hasMany(Product_1.default, { foreignKey: "userId" });
Product_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
Category_1.default.hasOne(Product_1.default, { foreignKey: "categoryId" });
Product_1.default.belongsTo(Category_1.default, { foreignKey: "categoryId" });
// product-cart relation
User_1.default.hasMany(Cart_1.default, { foreignKey: "userId" });
Cart_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
// user-cart relation
Product_1.default.hasMany(Cart_1.default, { foreignKey: "productId" });
Cart_1.default.belongsTo(Product_1.default, { foreignKey: "productId" });
// order-orderdetail relation
Order_1.default.hasMany(OrderDetails_1.default, { foreignKey: "orderId" });
OrderDetails_1.default.belongsTo(Order_1.default, { foreignKey: "orderId" });
// orderdetail-product relation
Product_1.default.hasMany(OrderDetails_1.default, { foreignKey: "productId" });
OrderDetails_1.default.belongsTo(Product_1.default, { foreignKey: "productId" });
// order-payment relation
Payment_1.default.hasOne(Order_1.default, { foreignKey: "paymentId" });
Order_1.default.belongsTo(Payment_1.default, { foreignKey: "paymentId" });
// order-user relation
User_1.default.hasMany(Order_1.default, { foreignKey: "userId" });
Order_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
// review-product relation
Product_1.default.hasMany(Review_1.default, { foreignKey: "productId" });
Review_1.default.belongsTo(Product_1.default, { foreignKey: "productId" });
// review-user relation
User_1.default.hasMany(Review_1.default, { foreignKey: "userId" });
Review_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
exports.default = sequelize;
