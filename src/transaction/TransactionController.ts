import { Request, Response } from "express";
import Transaction from "./Transaction";
import Wallet from "../wallet/Wallet";
import Category from "../category/Category";
import User from "../user/User";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

const TransactionController = {
  index: async (req: Request, res: Response) => {
    try {
      // @ts-ignore User comes from middleware
      const userName = req.user;
      const user = await User.findOne({ where: { name: userName.name } });
      const transactions = await Transaction.findAll(
        {
          where: { userId: user?.dataValues.id },
          include: [
            Wallet, Category
          ]
        }
      );;

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
  },
  extractReceipt: async (req: Request, res: Response) => {
    try {
      const { receiptText } = req.body;

      if (!receiptText) {
        return res.status(400).json({
          status: 400,
          message: "Receipt text is required.",
        });
      }

      // Call Ollama with a strict JSON schema for guaranteed, fast structured outputs
      const response = await ollama.chat({
        model: "llama3.2:3b",
        messages: [
          {
            role: "system",
            content: "You are an Indonesian receipt parser. Extract data accurately. Note: Periods in Indonesian prices represent thousands (e.g., 38.400 means 38400) - return them as pure numbers."
          },
          {
            role: "user",
            content: `Extract from this raw text:\n\n${receiptText}`
          }
        ],
        format: {
          type: 'object',
          properties: {
            receipt_name: { type: 'string', description: 'The merchant or store name.' },
            total_price: { type: 'number', description: 'The total grand amount paid.' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' }
                },
                required: ['name', 'price']
              }
            }
          },
          required: ['receipt_name', 'total_price', 'products']
        },
        options: {
          temperature: 0.0, // Maximizes speed and processing efficiency
        }
      });

      // Parse the guaranteed JSON string from the model
      const extractedData = JSON.parse(response.message.content);

      return res.status(200).json({
        status: 200,
        message: "Receipt information extracted successfully.",
        data: {
          receipt_name: extractedData.receipt_name,
          total_price: extractedData.total_price,
          products: extractedData.products,
        },
      });
    } catch (error: any) {
      console.error("Extraction error:", error);
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  }
};

export default TransactionController;
