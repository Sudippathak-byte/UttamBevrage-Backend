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
const Product_1 = __importDefault(require("../database/models/Product"));
const User_1 = __importDefault(require("../database/models/User"));
const Category_1 = __importDefault(require("../database/models/Category"));
const Review_1 = __importDefault(require("../database/models/Review"));
class ProductController {
    addProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const userID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { productName, productDescription, productTotalStockQty, productPrice, categoryId } = req.body;
            console.log(productName, productDescription, productTotalStockQty, productPrice, categoryId);
            let fileName;
            console.log((_b = req.file) === null || _b === void 0 ? void 0 : _b.filename);
            if (req.file) {
                fileName = (_c = req.file) === null || _c === void 0 ? void 0 : _c.filename;
            }
            else {
                fileName = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW1yhlTpkCnujnhzP-xioiy9RdDQkKLMnMSg&s";
            }
            if (!productName || !productDescription || !productTotalStockQty || !productPrice || !categoryId) {
                res.status(400).json({
                    message: "Please fill all fields"
                });
                return;
            }
            yield Product_1.default.create({
                productName,
                productDescription,
                productTotalStockQty,
                productPrice,
                productImageUrl: fileName,
                userId: userID,
                categoryId: categoryId
            });
            res.status(200).json({
                message: "Product added sucessfully"
            });
        });
    }
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Product_1.default.findAll({
                include: [
                    {
                        model: User_1.default,
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: Category_1.default,
                        attributes: ['id', 'categoryName']
                    }
                ]
            });
            res.status(200).json({
                message: "Products fetched sucessfully",
                data
            });
        });
    }
    getSingleProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const data = yield Product_1.default.findAll({
                where: {
                    id: id
                },
                include: [
                    {
                        model: User_1.default,
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: Category_1.default,
                        attributes: ['id', 'categoryName']
                    }
                ]
            });
            if (data.length === 0) {
                res.status(404).json({
                    message: "no product with that id"
                });
            }
            else {
                res.status(200).json({
                    message: "product fetched sucessfully",
                    data
                });
            }
        });
    }
    updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const { productName, productDescription, productTotalStockQty, productPrice, categoryId, } = req.body;
            const product = yield Product_1.default.findOne({ where: { id } });
            if (!product) {
                res.status(404).json({
                    message: "No product with that id",
                });
                return;
            }
            const updatedData = {};
            if (productName)
                updatedData.productName = productName;
            if (productDescription)
                updatedData.productDescription = productDescription;
            if (productTotalStockQty)
                updatedData.productTotalStockQty = productTotalStockQty;
            if (productPrice)
                updatedData.productPrice = productPrice;
            if (categoryId)
                updatedData.categoryId = categoryId;
            let fileName;
            if (req === null || req === void 0 ? void 0 : req.file) {
                // "http://localhost:3000/" + req?.file?.filename;
                fileName =
                    "http://localhost:3000/" + ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
                updatedData.productImageUrl = fileName;
            }
            yield Product_1.default.update(updatedData, { where: { id } });
            res.status(200).json({
                message: "Product updated successfully",
            });
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const data = yield Product_1.default.findAll({
                where: {
                    id: id
                }
            });
            if (data.length > 0) {
                yield Product_1.default.destroy({
                    where: {
                        id: id
                    }
                });
                res.status(200).json({
                    message: "product deleted sucessfully"
                });
            }
            else {
                res.status(404).json({
                    message: "no product with that id"
                });
            }
        });
    }
    createProductReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rating, reviewContent, reviewerName, userId } = req.body;
            const { id } = req.params;
            console.log(rating, reviewContent, reviewerName, userId);
            try {
                if (!rating || !reviewContent) {
                    res.status(400).json({
                        message: "Please provide rating and review ",
                    });
                    return;
                }
                if (!reviewerName || !userId) {
                    res.status(400).json({
                        message: "Please Login first!",
                    });
                    return;
                }
                const product = yield Product_1.default.findOne({ where: { id } });
                if (!product) {
                    res.status(404).json({
                        message: "Product not found",
                    });
                    return;
                }
                const alreadyReviewed = yield Review_1.default.findOne({
                    where: {
                        productId: id,
                        userId: userId,
                    },
                });
                if (alreadyReviewed) {
                    res.status(400).json({
                        message: "You have already reviewed this product",
                    });
                    return;
                }
                yield Review_1.default.create({
                    productId: id,
                    reviewerName,
                    rating: Number(rating),
                    reviewContent,
                    userId,
                });
                const productReviews = yield Review_1.default.findAll({
                    where: { productId: id },
                });
                const numReviews = productReviews.length;
                const ratingSum = productReviews.reduce((acc, review) => acc + review.rating, 0);
                const avgRating = Math.floor(ratingSum / numReviews);
                yield Product_1.default.update({ rating: avgRating, numReviews }, { where: { id } });
                res.status(200).json({
                    message: "Review added successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Something went wrong. Please try again later.",
                });
            }
        });
    }
}
exports.default = new ProductController();
