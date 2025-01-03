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
const Category_1 = __importDefault(require("../database/models/Category"));
class CategoryController {
    constructor() {
        this.categoryData = [
            {
                categoryName: "Electronics"
            },
            {
                categoryName: "Groceries"
            },
            {
                categoryName: "Food/Bevrages"
            }
        ];
    }
    seedCategory() {
        return __awaiter(this, void 0, void 0, function* () {
            const datas = yield Category_1.default.findAll();
            if (datas.length === 0) {
                const data = yield Category_1.default.bulkCreate(this.categoryData);
                console.log("Categories seeded sucessfully");
            }
            else {
                console.log("Categories already seeded");
            }
        });
    }
    addCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { categoryName } = req.body;
            if (!categoryName) {
                res.status(400).json({ message: "Please provide categoryName" });
                return;
            }
            yield Category_1.default.create({
                categoryName
            });
            res.status(200).json({
                message: "Category added sucessfully"
            });
        });
    }
    getCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Category_1.default.findAll();
            res.status(200).json({
                message: "Categories fetched",
                data
            });
        });
    }
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const data = yield Category_1.default.findAll({
                where: {
                    id
                }
            });
            if (data.length === 0) {
                res.status(404).json({
                    message: "Category not found"
                });
            }
            else {
                yield Category_1.default.destroy({
                    where: {
                        id
                    }
                });
                res.status(200).json({
                    message: "Category deleted sucessfully"
                });
            }
        });
    }
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { categoryName } = req.body;
            yield Category_1.default.update({ categoryName }, {
                where: {
                    id
                }
            });
            res.status(200).json({
                message: "Category updated sucessfully"
            });
        });
    }
}
exports.default = new CategoryController();
