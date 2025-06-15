// @ts-nocheck
import express from "express";
import UserController from "../user/UserController";
import CategoryController from "../category/CategoryController";
import WalletController from "../wallet/WalletController";
import TransactionController from "../transaction/TransactionController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

router.get("/users", UserController.getByEmail);
router.get("/users/:id", authenticateToken, UserController.show);
router.post("/register", UserController.store);
router.post("/login", UserController.login);
router.put("/users/:id", authenticateToken, UserController.update);
router.delete("/users/:id", authenticateToken, UserController.delete);
router.put("/user/change-password", UserController.changePassword)

router.get("/categories", authenticateToken, CategoryController.index);
router.get("/categories/:id", authenticateToken, CategoryController.show);
router.post("/categories", authenticateToken, CategoryController.store);
router.put("/categories/:id", authenticateToken, CategoryController.update);
router.delete("/categories/:id", authenticateToken, CategoryController.delete);

router.get("/wallets", authenticateToken, WalletController.index);
router.get("/wallets/:id", authenticateToken, WalletController.show);
router.post("/wallets", authenticateToken, WalletController.store);
router.put("/wallets/:id", authenticateToken, WalletController.update);
router.delete("/wallets/:id", authenticateToken, WalletController.delete);

router.get("/transactions", authenticateToken, TransactionController.index);
router.get("/transactions/:id", authenticateToken, TransactionController.show);
router.post("/transactions", authenticateToken, TransactionController.store);
router.put(
  "/transactions/:id",
  authenticateToken,
  TransactionController.update
);
router.delete(
  "/transactions/:id",
  authenticateToken,
  TransactionController.delete
);

export default router;
