import express, { Router } from "express";
import authMiddleware, { Role } from "../middleware/authMiddleware";

import { multer, storage } from "../middleware/multerMiddleware";
import errorHandler from "../services/catchAsyncError";
import productController from "../controllers/productController";

const upload = multer({ storage: storage });
const router: Router = express.Router();

router
  .route("/")
  .post(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    upload.single("image"),
    errorHandler(productController.addProduct)
  )
  .get(productController.getAllProducts);

router
  .route("/:id")
  .get(productController.getSingleProduct)
  .delete(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    productController.deleteProduct
  )
  .patch(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    upload.single("image"),
    productController.updateProduct
  );

router
  .route("/review/:id")
  .post(
    authMiddleware.isAuthenticated,
    errorHandler(productController.createProductReview)
  );
export default router;
