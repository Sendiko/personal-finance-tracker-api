import { Request, Response } from "express";
import Transaction from "../transaction/Transaction";
import Wallet from "./Wallet";


const WalletController = {
  index: async (req: Request, res: Response) => {
    try {
      const wallets = await Wallet.findAll();

      return res.status(200).json({
        status: 200,
        message: "Wallets sent successfully.",
        wallets: wallets,
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
      const wallet = await Wallet.findAll({
        where: { userId: req.params.id },
        include: Transaction
      });

      if (!wallet) {
        return res.status(404).json({
          status: 404,
          message: "Wallet not found.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Wallet sent successfully.",
        wallet: wallet,
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
      const wallet = await Wallet.create(req.body);

      return res.status(201).json({
        status: 201,
        message: "Wallet registered successfully.",
        wallet: wallet,
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
      const wallet = await Wallet.findByPk(req.params.id);

      if (!wallet) {
        return res.status(404).json({
          status: 404,
          message: "Wallet not found.",
        });
      }

      await wallet.update(req.body)

      return res.status(200).json({
        status: 200,
        message: "Wallet updated successfully.",
        wallet: wallet,
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
      const wallet = await Wallet.findByPk(req.params.id);

      if (!wallet) {
        return res.status(404).json({
          status: 404,
          message: "Wallet not found.",
        });
      }

      await Transaction.destroy({
        // @ts-ignore: wallet has id
        where: { walletId: wallet.id }
      })

      await wallet.destroy();

      return res.status(200).json({
        status: 200,
        message: "Wallet deleted successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
};

export default WalletController