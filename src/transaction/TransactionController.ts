import { Request, Response } from "express";
import Transaction from "./Transaction";
import Wallet from "../wallet/Wallet";
import Category from "../category/Category";
import User from "../user/User";
import { Ollama } from "ollama";

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

      const ollama = new Ollama({ host: "http://localhost:11434" });

      const prompt = `Extract the following information from this receipt text and return it as JSON:
                      1. receipt_name: The name/merchant name of the receipt
                      2. total_price: The total amount paid
                      3. products: An array of products with name and price for each item

                      Receipt Text:
                      ${receiptText}

                      Return ONLY valid JSON in this format:
                      {
                        "receipt_name": "string",
                        "total_price": number,
                        "products": [
                          { "name": "string", "price": number },
                          ...
                        ]
                      }`;

      const response = await ollama.generate({
        model: "llama2",
        prompt: prompt,
        stream: false,
      });

      // Parse the response from Ollama
      const responseText = response.response;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return res.status(422).json({
          status: 422,
          message: "Failed to extract receipt information.",
          error: "Could not parse receipt data from Ollama response",
        });
      }

      const extractedData = JSON.parse(jsonMatch[0]);

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
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  }
};

export default TransactionController;
