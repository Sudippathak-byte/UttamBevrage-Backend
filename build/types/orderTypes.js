"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.TransactionStatus = exports.PaymentStatus = exports.PaymentMethod = void 0;
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["Cod"] = "cod";
    PaymentMethod["Khalti"] = "khalti";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Unpaid"] = "unpaid";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["Completed"] = "completed";
    TransactionStatus["Refunded"] = "refunded";
    TransactionStatus["Pending"] = "pending";
    TransactionStatus["Initiated"] = "initiated";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "pending";
    OrderStatus["Cancelled"] = "cancelled ";
    OrderStatus["Ontheway"] = "ontheway";
    OrderStatus["Delivered"] = "delivered";
    OrderStatus["Preparation"] = "preparation";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
