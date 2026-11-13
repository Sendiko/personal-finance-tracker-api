import { Request, Response } from "express";
import { Op, Transaction as DatabaseTransaction } from "sequelize";
import db from "../config/db";
import User from "../user/User";
import Wallet from "../wallet/Wallet";
import Transfer from "./Transfer";

type TransferInput = {
  amount?: number | string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  date?: string;
};

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  // @ts-ignore User is set by the authentication middleware.
  const authenticatedUser = req.user;
  if (!authenticatedUser?.name) {
    return null;
  }

  const user = await User.findOne({ where: { name: authenticatedUser.name } });
  return user?.dataValues.id || null;
}

function getTransferValues(body: TransferInput) {
  const amount = Number(body.amount);
  return {
    amount,
    sourceWalletId: body.sourceWalletId,
    destinationWalletId: body.destinationWalletId,
    createdAt: body.date,
  };
}

function validateTransferValues(values: ReturnType<typeof getTransferValues>) {
  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    return "amount must be a positive number.";
  }
  if (!values.sourceWalletId || !values.destinationWalletId) {
    return "sourceWalletId and destinationWalletId are required.";
  }
  if (values.sourceWalletId === values.destinationWalletId) {
    return "Source and destination wallets must be different.";
  }
  if (values.createdAt && Number.isNaN(new Date(values.createdAt).getTime())) {
    return "Invalid date. Use a valid date.";
  }
  return null;
}

async function findWallets(
  userId: string,
  sourceWalletId: string,
  destinationWalletId: string,
  transaction: DatabaseTransaction
): Promise<{ sourceWallet: any; destinationWallet: any }> {
  const wallets = await Wallet.findAll({
    where: {
      userId,
      id: { [Op.in]: [sourceWalletId, destinationWalletId] },
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const sourceWallet = wallets.find((wallet) => wallet.dataValues.id === sourceWalletId);
  const destinationWallet = wallets.find((wallet) => wallet.dataValues.id === destinationWalletId);
  return { sourceWallet, destinationWallet };
}

function applyBalanceChange(sourceWallet: any, destinationWallet: any, amount: number) {
  sourceWallet.balance = Number(sourceWallet.balance) - amount;
  destinationWallet.balance = Number(destinationWallet.balance) + amount;
}

const TransferController = {
  index: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }

      const transfers = await Transfer.findAll({
        where: { userId },
        include: [
          { model: Wallet, as: "sourceWallet" },
          { model: Wallet, as: "destinationWallet" },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json({ status: 200, message: "Transfers sent successfully.", transfers });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  show: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }
      const transfer = await Transfer.findOne({
        where: { id: req.params.id, userId },
        include: [
          { model: Wallet, as: "sourceWallet" },
          { model: Wallet, as: "destinationWallet" },
        ],
      });
      if (!transfer) {
        return res.status(404).json({ status: 404, message: "Transfer not found." });
      }
      return res.status(200).json({ status: 200, message: "Transfer sent successfully.", transfer });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  store: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }
      const values = getTransferValues(req.body);
      const validationError = validateTransferValues(values);
      if (validationError) {
        return res.status(400).json({ status: 400, message: validationError });
      }

      const transfer = await db.transaction(async (transaction) => {
        const { sourceWallet, destinationWallet } = await findWallets(
          userId,
          values.sourceWalletId!,
          values.destinationWalletId!,
          transaction
        );
        if (!sourceWallet || !destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        applyBalanceChange(sourceWallet, destinationWallet, values.amount);
        await sourceWallet.save({ transaction });
        await destinationWallet.save({ transaction });
        return Transfer.create(
          { ...values, userId, createdAt: values.createdAt || undefined },
          { transaction }
        );
      });

      return res.status(201).json({ status: 201, message: "Transfer registered successfully.", transfer });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.status ? error.message : "Server error.",
        ...(error.status ? {} : { error: error.message }),
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }
      const existing = await Transfer.findOne({ where: { id: req.params.id, userId } });
      if (!existing) {
        return res.status(404).json({ status: 404, message: "Transfer not found." });
      }
      const values = getTransferValues({ ...existing.dataValues, ...req.body });
      const validationError = validateTransferValues(values);
      if (validationError) {
        return res.status(400).json({ status: 400, message: validationError });
      }

      const transfer = await db.transaction(async (transaction) => {
        const oldWallets = await findWallets(
          userId,
          existing.dataValues.sourceWalletId,
          existing.dataValues.destinationWalletId,
          transaction
        );
        if (!oldWallets.sourceWallet || !oldWallets.destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        oldWallets.sourceWallet.balance = Number(oldWallets.sourceWallet.balance) + Number(existing.dataValues.amount);
        oldWallets.destinationWallet.balance = Number(oldWallets.destinationWallet.balance) - Number(existing.dataValues.amount);
        await oldWallets.sourceWallet.save({ transaction });
        await oldWallets.destinationWallet.save({ transaction });

        const newWallets = await findWallets(userId, values.sourceWalletId!, values.destinationWalletId!, transaction);
        if (!newWallets.sourceWallet || !newWallets.destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        applyBalanceChange(newWallets.sourceWallet, newWallets.destinationWallet, values.amount);
        await newWallets.sourceWallet.save({ transaction });
        await newWallets.destinationWallet.save({ transaction });
        await existing.update({ ...values, createdAt: values.createdAt || undefined }, { transaction });
        return existing;
      });

      return res.status(200).json({ status: 200, message: "Transfer updated successfully.", transfer });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.status ? error.message : "Server error.",
        ...(error.status ? {} : { error: error.message }),
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }
      const existing = await Transfer.findOne({ where: { id: req.params.id, userId } });
      if (!existing) {
        return res.status(404).json({ status: 404, message: "Transfer not found." });
      }

      await db.transaction(async (transaction) => {
        const { sourceWallet, destinationWallet } = await findWallets(
          userId,
          existing.dataValues.sourceWalletId,
          existing.dataValues.destinationWalletId,
          transaction
        );
        if (!sourceWallet || !destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        sourceWallet.balance = Number(sourceWallet.balance) + Number(existing.dataValues.amount);
        destinationWallet.balance = Number(destinationWallet.balance) - Number(existing.dataValues.amount);
        await sourceWallet.save({ transaction });
        await destinationWallet.save({ transaction });
        await existing.destroy({ transaction });
      });

      return res.status(200).json({ status: 200, message: "Transfer deleted successfully." });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.status ? error.message : "Server error.",
        ...(error.status ? {} : { error: error.message }),
      });
    }
  },
};

export default TransferController;
