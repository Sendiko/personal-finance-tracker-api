import { Request, Response } from "express";
import { Op, Transaction as DatabaseTransaction } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db";
import User from "../user/User";
import Wallet from "../wallet/Wallet";
import Transaction from "../transaction/Transaction";

type TransferInput = {
  name?: string;
  amount?: number | string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  categoryId?: string;
  date?: string;
};

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  // @ts-ignore User is set by the authentication middleware.
  const authenticatedUser = req.user;
  if (!authenticatedUser?.name) return null;
  const user = await User.findOne({ where: { name: authenticatedUser.name } });
  return user?.dataValues.id || null;
}

function getValues(body: TransferInput) {
  return {
    name: body.name || "Wallet transfer",
    amount: Number(body.amount),
    sourceWalletId: body.sourceWalletId,
    destinationWalletId: body.destinationWalletId,
    categoryId: body.categoryId,
    createdAt: body.date,
  };
}

function validate(values: ReturnType<typeof getValues>) {
  if (!Number.isFinite(values.amount) || values.amount <= 0) return "amount must be a positive number.";
  if (!values.sourceWalletId || !values.destinationWalletId) {
    return "sourceWalletId and destinationWalletId are required.";
  }
  if (values.sourceWalletId === values.destinationWalletId) {
    return "Source and destination wallets must be different.";
  }
  if (!values.categoryId) return "categoryId is required.";
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
) {
  const wallets = await Wallet.findAll({
    where: { userId, id: { [Op.in]: [sourceWalletId, destinationWalletId] } },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  return {
    sourceWallet: wallets.find((wallet) => wallet.dataValues.id === sourceWalletId),
    destinationWallet: wallets.find((wallet) => wallet.dataValues.id === destinationWalletId),
  };
}

function applyBalanceChange(sourceWallet: any, destinationWallet: any, amount: number) {
  sourceWallet.balance = Number(sourceWallet.balance) - amount;
  destinationWallet.balance = Number(destinationWallet.balance) + amount;
}

async function findPair(userId: string, transferId: string, transaction?: DatabaseTransaction) {
  const pair = await Transaction.findAll({
    where: { userId, transferId, isTransfer: true },
    include: [Wallet],
    transaction,
    ...(transaction ? { lock: transaction.LOCK.UPDATE } : {}),
  });
  const source = pair.find((item) => item.dataValues.type === "expense");
  const destination = pair.find((item) => item.dataValues.type === "income");
  return source && destination ? { source, destination } : null;
}

function formatTransfer(pair: { source: any; destination: any }) {
  return {
    transferId: pair.source.dataValues.transferId,
    name: pair.source.dataValues.name,
    amount: Number(pair.source.dataValues.amount),
    categoryId: pair.source.dataValues.categoryId,
    sourceWalletId: pair.source.dataValues.walletId,
    destinationWalletId: pair.destination.dataValues.walletId,
    date: pair.source.dataValues.createdAt,
    sourceTransaction: pair.source,
    destinationTransaction: pair.destination,
  };
}

function errorResponse(res: Response, error: any) {
  const status = error.status || 500;
  return res.status(status).json({
    status,
    message: error.status ? error.message : "Server error.",
    ...(error.status ? {} : { error: error.message }),
  });
}

const TransferController = {
  index: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ status: 401, message: "Unauthorized." });
      const transactions = await Transaction.findAll({
        where: { userId, isTransfer: true },
        include: [Wallet],
        order: [["createdAt", "DESC"]],
      });
      const transfers = Array.from(
        transactions.reduce((groups, transaction) => {
          const transferId = transaction.dataValues.transferId;
          const group = groups.get(transferId) || [];
          group.push(transaction);
          groups.set(transferId, group);
          return groups;
        }, new Map<string, any[]>())
      )
        .map(([, pair]) => {
          const source = pair.find((item) => item.dataValues.type === "expense");
          const destination = pair.find((item) => item.dataValues.type === "income");
          return source && destination ? formatTransfer({ source, destination }) : null;
        })
        .filter(Boolean);
      return res.status(200).json({ status: 200, message: "Transfers sent successfully.", transfers });
    } catch (error: any) {
      return errorResponse(res, error);
    }
  },

  show: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ status: 401, message: "Unauthorized." });
      const pair = await findPair(userId, req.params.id as string);
      if (!pair) return res.status(404).json({ status: 404, message: "Transfer not found." });
      return res.status(200).json({ status: 200, message: "Transfer sent successfully.", transfer: formatTransfer(pair) });
    } catch (error: any) {
      return errorResponse(res, error);
    }
  },

  store: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ status: 401, message: "Unauthorized." });
      const values = getValues(req.body);
      const validationError = validate(values);
      if (validationError) return res.status(400).json({ status: 400, message: validationError });

      const transfer = await db.transaction(async (transaction) => {
        const wallets = await findWallets(userId, values.sourceWalletId!, values.destinationWalletId!, transaction);
        if (!wallets.sourceWallet || !wallets.destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        applyBalanceChange(wallets.sourceWallet, wallets.destinationWallet, values.amount);
        await wallets.sourceWallet.save({ transaction });
        await wallets.destinationWallet.save({ transaction });

        const transferId = uuidv4();
        const common = {
          name: values.name,
          amount: values.amount,
          categoryId: values.categoryId,
          userId,
          transferId,
          isTransfer: true,
          createdAt: values.createdAt || undefined,
        };
        const [source, destination] = await Promise.all([
          Transaction.create({ ...common, type: "expense", walletId: values.sourceWalletId }, { transaction }),
          Transaction.create({ ...common, type: "income", walletId: values.destinationWalletId }, { transaction }),
        ]);
        return formatTransfer({ source, destination });
      });
      return res.status(201).json({ status: 201, message: "Transfer registered successfully.", transfer });
    } catch (error: any) {
      return errorResponse(res, error);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ status: 401, message: "Unauthorized." });
      const existing = await findPair(userId, req.params.id as string);
      if (!existing) return res.status(404).json({ status: 404, message: "Transfer not found." });
      const values = getValues({ ...existing.source.dataValues, sourceWalletId: existing.source.dataValues.walletId, destinationWalletId: existing.destination.dataValues.walletId, date: existing.source.dataValues.createdAt, ...req.body });
      const validationError = validate(values);
      if (validationError) return res.status(400).json({ status: 400, message: validationError });

      const transfer = await db.transaction(async (transaction) => {
        const oldWallets = await findWallets(userId, existing.source.dataValues.walletId, existing.destination.dataValues.walletId, transaction);
        if (!oldWallets.sourceWallet || !oldWallets.destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        applyBalanceChange(oldWallets.destinationWallet, oldWallets.sourceWallet, Number(existing.source.dataValues.amount));
        await oldWallets.sourceWallet.save({ transaction });
        await oldWallets.destinationWallet.save({ transaction });

        const newWallets = await findWallets(userId, values.sourceWalletId!, values.destinationWalletId!, transaction);
        if (!newWallets.sourceWallet || !newWallets.destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        applyBalanceChange(newWallets.sourceWallet, newWallets.destinationWallet, values.amount);
        await newWallets.sourceWallet.save({ transaction });
        await newWallets.destinationWallet.save({ transaction });
        const common = {
          name: values.name,
          amount: values.amount,
          categoryId: values.categoryId,
          createdAt: values.createdAt || undefined,
        };
        await existing.source.update({ ...common, type: "expense", walletId: values.sourceWalletId }, { transaction });
        await existing.destination.update({ ...common, type: "income", walletId: values.destinationWalletId }, { transaction });
        return formatTransfer({ source: existing.source, destination: existing.destination });
      });
      return res.status(200).json({ status: 200, message: "Transfer updated successfully.", transfer });
    } catch (error: any) {
      return errorResponse(res, error);
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ status: 401, message: "Unauthorized." });
      const existing = await findPair(userId, req.params.id as string);
      if (!existing) return res.status(404).json({ status: 404, message: "Transfer not found." });
      await db.transaction(async (transaction) => {
        const wallets = await findWallets(userId, existing.source.dataValues.walletId, existing.destination.dataValues.walletId, transaction);
        if (!wallets.sourceWallet || !wallets.destinationWallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }
        applyBalanceChange(wallets.destinationWallet, wallets.sourceWallet, Number(existing.source.dataValues.amount));
        await wallets.sourceWallet.save({ transaction });
        await wallets.destinationWallet.save({ transaction });
        await existing.source.destroy({ transaction });
        await existing.destination.destroy({ transaction });
      });
      return res.status(200).json({ status: 200, message: "Transfer deleted successfully." });
    } catch (error: any) {
      return errorResponse(res, error);
    }
  },
};

export default TransferController;
