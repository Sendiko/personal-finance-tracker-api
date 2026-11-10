import { Request, Response } from "express";
import { Op } from "sequelize";
import Transaction from "./Transaction";
import Wallet from "../wallet/Wallet";
import Category from "../category/Category";
import User from "../user/User";

const TransactionController = {
  index: async (req: Request, res: Response) => {
    try {
      // @ts-ignore User comes from middleware
      const userName = req.user;
      const user = await User.findOne({ where: { name: userName.name } });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const dateFilter: { [Op.gte]?: Date; [Op.lte]?: Date } = {};

      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        if (Number.isNaN(startDateObj.getTime())) {
          return res.status(400).json({
            status: 400,
            message: "Invalid startDate. Use a valid date.",
          });
        }
        dateFilter[Op.gte] = startDateObj;
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        if (Number.isNaN(endDateObj.getTime())) {
          return res.status(400).json({
            status: 400,
            message: "Invalid endDate. Use a valid date.",
          });
        }
        dateFilter[Op.lte] = endDateObj;
      }

      const startBoundary = dateFilter[Op.gte];
      const endBoundary = dateFilter[Op.lte];
      if (startBoundary && endBoundary && startBoundary.getTime() > endBoundary.getTime()) {
        return res.status(400).json({
          status: 400,
          message: "startDate cannot be after endDate.",
        });
      }

      const requestedTypes = req.query.type
        ? (Array.isArray(req.query.type) ? req.query.type : [req.query.type])
            .flatMap((value) => String(value).split(","))
        : [];
      const allowedTypes = ["income", "expense"];
      const invalidType = requestedTypes.find((type) => !allowedTypes.includes(type));

      if (invalidType) {
        return res.status(400).json({
          status: 400,
          message: "Invalid type. Allowed values are income and expense.",
        });
      }

      const where: Record<string | symbol, unknown> = {
        userId: user.dataValues.id,
      };

      if (startDate || endDate) {
        where.createdAt = dateFilter;
      }

      if (requestedTypes.length > 0) {
        where.type = requestedTypes.length === 1
          ? requestedTypes[0]
          : { [Op.in]: requestedTypes };
      }

      const transactions = await Transaction.findAll({
        where,
        include: [Wallet, Category],
      });

      return res.status(200).json({
        status: 200,
        message: "Transactions sent successfully.",
        transactions: transactions,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
  show: async (req: Request, res: Response) => {
    try {
      const transaction = await Transaction.findByPk(req.params.id as string, {
        include: [
          {
            model: Wallet,
          },
          {
            model: Category
          }
        ]
      });

      if (!transaction) {
        return res.status(404).json({
          status: 404,
          message: "Transaction not found.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Transaction sent successfully.",
        transaction: transaction,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
  store: async (req: Request, res: Response) => {
    try {
      const transactionData = req.body.date
        ? { ...req.body, createdAt: req.body.date }
        : req.body;
      const transaction = await Transaction.create(transactionData);

      // @ts-ignore: transaction has type
      if (transaction.type === "expense") {
        const wallet = await Wallet.findOne({
          // @ts-ignore: transaction has walletId
          where: { id: transaction.walletId },
        });

        if (!wallet) {
          return res.status(404).json({
            status: 404,
            message: "Wallet not found.",
          });
        }

        // @ts-ignore: transaction has amount and wallet has balance
        wallet.balance -= transaction.amount;
        await wallet.save();
      } else {
        const wallet = await Wallet.findOne({
          // @ts-ignore: transaction has walletId
          where: { id: transaction.walletId },
        });

        if (!wallet) {
          return res.status(404).json({
            status: 404,
            message: "Wallet not found.",
          });
        }

        // @ts-ignore: transaction has amount and wallet has balance
        wallet.balance += transaction.amount;
        await wallet.save();
      }

      return res.status(201).json({
        status: 201,
        message: "Transaction registered successfully.",
        transaction: transaction,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const transaction = await Transaction.findByPk(req.params.id as string);

      if (!transaction) {
        return res.status(404).json({
          status: 404,
          message: "Transaction not found.",
        });
      }

      await transaction.update(req.body);

      // @ts-ignore: transaction has type
      if (transaction.type === "expense") {
        const wallet = await Wallet.findOne({
          // @ts-ignore: transaction has walletId
          where: { id: transaction.walletId },
        });

        if (!wallet) {
          return res.status(404).json({
            status: 404,
            message: "Wallet not found.",
          });
        }

        // @ts-ignore: transaction has amount and wallet has balance
        wallet.balance -= transaction.amount;
        await wallet.save();
      } else {
        // @ts-ignore: transaction has type
        if (transaction.type === "income") {
          const wallet = await Wallet.findOne({
            // @ts-ignore: transaction has walletId
            where: { id: transaction.walletId },
          });

          if (!wallet) {
            return res.status(404).json({
              status: 404,
              message: "Wallet not found.",
            });
          }

          // @ts-ignore: transaction has amount and wallet has balance
          wallet.balance += transaction.amount;
          await wallet.save();
        }
      }

      return res.status(200).json({
        status: 200,
        message: "Transaction updated successfully.",
        transaction: transaction,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const transaction = await Transaction.findByPk(req.params.id as string);

      if (!transaction) {
        return res.status(404).json({
          status: 404,
          message: "Transaction not found.",
        });
      }

      const wallet = await Wallet.findOne({
        // @ts-ignore: transaction has walletId
        where: { id: transaction.walletId },
      })

      // @ts-ignore: transaction has amount and wallet has balance
      await wallet.update({ balance: wallet.balance - transaction.amount });

      await transaction.destroy();

      return res.status(200).json({
        status: 200,
        message: "Transaction deleted successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  }
};

export default TransactionController;
