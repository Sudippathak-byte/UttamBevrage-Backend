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
const orderTypes_1 = require("../types/orderTypes");
const Order_1 = __importDefault(require("../database/models/Order"));
const Payment_1 = __importDefault(require("../database/models/Payment"));
const OrderDetails_1 = __importDefault(require("../database/models/OrderDetails"));
const Cart_1 = __importDefault(require("../database/models/Cart"));
const axios_1 = __importDefault(require("axios"));
const Product_1 = __importDefault(require("../database/models/Product"));
const Category_1 = __importDefault(require("../database/models/Category"));
const User_1 = __importDefault(require("../database/models/User"));
class ExtendedOrder extends Order_1.default {
}
class OrderController {
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { phoneNumber, shippingAddress, totalAmount, paymentDetails, items, } = req.body;
            if (!paymentDetails || !paymentDetails.paymentMethod || items.length == 0) {
                res.status(400).json({
                    message: "Please provide paymentDetails and items",
                });
                return;
            }
            if (!phoneNumber || !shippingAddress || !totalAmount) {
                res.status(400).json({
                    message: "Please provide phoneNumber,shippingAddress,totalAmount",
                });
                return;
            }
            const paymentData = yield Payment_1.default.create({
                paymentMethod: paymentDetails.paymentMethod,
            });
            const orderData = yield Order_1.default.create({
                phoneNumber,
                shippingAddress,
                totalAmount,
                userId,
                paymentId: paymentData.id,
            });
            for (var i = 0; i < items.length; i++) {
                yield OrderDetails_1.default.create({
                    quantity: items[i].quantity,
                    productId: items[i].productId,
                    orderId: orderData.id,
                });
                yield Cart_1.default.destroy({
                    where: {
                        productId: items[i].productId,
                        userId: userId,
                    },
                });
            }
            if (paymentDetails.paymentMethod === orderTypes_1.PaymentMethod.Khalti) {
                // khalti integration
                const data = {
                    return_url: "http://localhost:3000/success",
                    purchase_order_id: orderData.id,
                    amount: totalAmount * 100,
                    website_url: "http://localhost:3000/",
                    purchase_order_name: "orderName_" + orderData.id,
                };
                const response = yield axios_1.default.post('https://a.khalti.com/api/v2/epayment/initiate/', data, {
                    headers: {
                        'Authorization': 'key 310e62ea2e4849b1ab44de0d0aafcb78'
                    }
                });
                const khaltiResponse = response.data;
                paymentData.pidx = khaltiResponse.pidx;
                paymentData.save();
                res.status(200).json({
                    message: "order placed successfully",
                    url: khaltiResponse.payment_url,
                });
            }
            else {
                res.status(200).json({
                    message: "Order placed successfully",
                });
            }
        });
    }
    verifyTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pidx } = req.body;
            if (!pidx) {
                res.status(400).json({
                    message: "Please provide pidx",
                });
                return;
            }
            const response = yield axios_1.default.post("https://a.khalti.com/api/v2/epayment/lookup/", { pidx }, {
                headers: {
                    'Authorization': 'key 310e62ea2e4849b1ab44de0d0aafcb78'
                }
            });
            const data = response.data;
            console.log(data);
            if (data.status === orderTypes_1.TransactionStatus.Completed) {
                yield Payment_1.default.update({ paymentStatus: "paid" }, {
                    where: {
                        pidx: pidx,
                    },
                });
                res.status(200).json({
                    message: "Payment verified successfully",
                });
            }
            else {
                res.status(200).json({
                    message: "Payment not verified",
                });
            }
        });
    }
    // customer SIDE Starts here
    fetchMyOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const orders = yield Order_1.default.findAll({
                where: {
                    userId,
                },
                include: [
                    {
                        model: Payment_1.default,
                    },
                ],
            });
            if (orders.length > 0) {
                res.status(200).json({
                    message: "order fetched successfully",
                    data: orders,
                });
            }
            else {
                res.status(404).json({
                    message: "you haven't ordered anything yet..",
                    data: [],
                });
            }
        });
    }
    fetchOrderDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = req.params.id;
            const orderDetails = yield OrderDetails_1.default.findAll({
                where: {
                    orderId,
                },
                include: [
                    {
                        model: Product_1.default,
                        include: [
                            {
                                model: Category_1.default,
                                attributes: ["categoryName"],
                            },
                        ],
                    },
                    {
                        model: Order_1.default,
                        include: [
                            { model: Payment_1.default, attributes: ["paymentMethod", "paymentStatus"] },
                            { model: User_1.default, attributes: ["username", "email"] },
                        ],
                    },
                ],
            });
            if (orderDetails.length > 0) {
                res.status(200).json({
                    message: "orderDetails fetched successfully",
                    data: orderDetails,
                });
            }
            else {
                res.status(404).json({
                    message: "no any orderDetails of that id",
                    data: [],
                });
            }
        });
    }
    cancelMyOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const orderId = req.params.id;
            const order = yield Order_1.default.findAll({
                where: {
                    userId,
                    id: orderId,
                },
            });
            if ((order === null || order === void 0 ? void 0 : order.orderStatus) === orderTypes_1.OrderStatus.Ontheway ||
                (order === null || order === void 0 ? void 0 : order.orderStatus) === orderTypes_1.OrderStatus.Preparation) {
                res.status(200).json({
                    message: "You cannot cancell order when it is in ontheway or prepared",
                });
                return;
            }
            yield Order_1.default.update({ orderStatus: orderTypes_1.OrderStatus.Cancelled }, {
                where: {
                    id: orderId,
                },
            });
            res.status(200).json({
                message: "Order cancelled successfully",
            });
        });
    }
    // Admin side starts here
    changeOrderStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = req.params.id;
            const orderStatus = req.body.orderStatus;
            yield Order_1.default.update({
                orderStatus: orderStatus,
            }, {
                where: {
                    id: orderId,
                },
            });
            res.status(200).json({
                message: "Order Status updated successfully",
            });
        });
    }
    changePaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = req.params.id;
            const paymentStatus = req.body.paymentStatus;
            const order = yield Order_1.default.findByPk(orderId);
            const extendedOrder = order;
            yield Payment_1.default.update({
                paymentStatus: paymentStatus,
            }, {
                where: {
                    id: extendedOrder.paymentId,
                },
            });
            res.status(200).json({
                // message: `Payment Status of orderId ${orderId} updated successfully to ${paymentStatus} `,
                message: `Payment Status updated successfully `,
            });
        });
    }
    deleteOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = req.params.id;
            const order = yield Order_1.default.findByPk(orderId);
            const extendedOrder = order;
            if (order) {
                yield OrderDetails_1.default.destroy({
                    where: {
                        orderId: orderId,
                    },
                });
                yield Payment_1.default.destroy({
                    where: {
                        id: extendedOrder.paymentId,
                    },
                });
                yield Order_1.default.destroy({
                    where: {
                        id: orderId,
                    },
                });
                res.status(200).json({
                    message: "Order deleted successfully",
                });
            }
            else {
                res.status(404).json({
                    message: "No order with that orderId",
                });
            }
        });
    }
    fetchOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield Order_1.default.findAll({
                include: [
                    {
                        model: Payment_1.default,
                    },
                ],
            });
            if (orders.length > 0) {
                res.status(200).json({
                    message: "order fetched successfully",
                    data: orders,
                });
            }
            else {
                res.status(404).json({
                    message: "you haven't ordered anything yet..",
                    data: [],
                });
            }
        });
    }
}
exports.default = new OrderController();
