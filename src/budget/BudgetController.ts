import { Request, Response } from "express";
import { Op } from "sequelize";
import Budget from "./Budget";
import Transaction from "../transaction/Transaction";
import User from "../user/User";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86400000) + 1;
}

function isValidDate(date: unknown): date is string {
  if (typeof date !== "string" || !datePattern.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
}

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  // @ts-ignore User is set by the authentication middleware.
  const authenticatedUser = req.user;
  if (!authenticatedUser?.name) {
    return null;
  }

  const user = await User.findOne({ where: { name: authenticatedUser.name } });
  return user?.dataValues.id || null;
}

async function getBudgetSummary(budget: any, today = getToday()) {
  const amount = Number(budget.amount);
  const startDate = budget.startDate;
  const endDate = budget.endDate;
  const periodStart = new Date(`${startDate}T00:00:00.000Z`);
  const periodEnd = new Date(`${addDays(endDate, 1)}T00:00:00.000Z`);
  const todayInBudget = today >= startDate && today <= endDate;
  const summaryEnd = todayInBudget ? today : today < startDate ? null : endDate;

  const spentWhere: any = {
    userId: budget.userId,
    type: "expense",
    isTransfer: false,
    createdAt: {
      [Op.gte]: periodStart,
      [Op.lt]: summaryEnd
        ? new Date(`${addDays(summaryEnd, 1)}T00:00:00.000Z`)
        : periodEnd,
    },
  };
  const periodTransactions = summaryEnd
    ? await Transaction.findAll({ where: spentWhere })
    : [];
  const spent = periodTransactions.reduce(
    (total: number, transaction: any) => total + Number(transaction.amount),
    0
  );

  let spentToday = 0;
  if (todayInBudget) {
    const todayTransactions = await Transaction.findAll({
      where: {
        ...spentWhere,
        createdAt: {
          [Op.gte]: new Date(`${today}T00:00:00.000Z`),
          [Op.lt]: new Date(`${addDays(today, 1)}T00:00:00.000Z`),
        },
      },
    });
    spentToday = todayTransactions.reduce(
      (total: number, transaction: any) => total + Number(transaction.amount),
      0
    );
  }

  const remainingAmount = Math.max(amount - spent, 0);
  const remainingDays = todayInBudget ? getDaysBetween(today, endDate) : 0;
  const dailyBudget = remainingDays > 0 ? remainingAmount / remainingDays : 0;

  return {
    totalAmount: amount,
    spent,
    remainingAmount,
    remainingDays,
    todayBudget: todayInBudget ? dailyBudget : 0,
    spentToday,
    remainingToday: todayInBudget ? Math.max(dailyBudget - spentToday, 0) : 0,
    isActive: todayInBudget,
  };
}

const BudgetController = {
  index: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }

      const budgets = await Budget.findAll({ where: { userId }, order: [["startDate", "DESC"]] });
      const budgetsWithSummary = await Promise.all(
        budgets.map(async (budget: any) => ({
          ...budget.toJSON(),
          summary: await getBudgetSummary(budget),
        }))
      );

      return res.status(200).json({
        status: 200,
        message: "Budgets sent successfully.",
        budgets: budgetsWithSummary,
      });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  show: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      const budget = await Budget.findOne({ where: { id: req.params.id, userId: userId || "" } });
      if (!budget) {
        return res.status(404).json({ status: 404, message: "Budget not found." });
      }

      return res.status(200).json({
        status: 200,
        message: "Budget sent successfully.",
        budget: { ...budget.toJSON(), summary: await getBudgetSummary(budget) },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  today: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }

      const today = getToday();
      const budget = await Budget.findOne({
        where: {
          userId,
          startDate: { [Op.lte]: today },
          endDate: { [Op.gte]: today },
        },
        order: [["startDate", "DESC"]],
      });
      if (!budget) {
        return res.status(404).json({ status: 404, message: "Budget not found." });
      }

      return res.status(200).json({
        status: 200,
        message: "Today's budget sent successfully.",
        summary: await getBudgetSummary(budget, today),
      });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  store: async (req: Request, res: Response) => {
    try {
      const { amount, startDate, endDate } = req.body;
      const numericAmount = Number(amount);
      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0 ||
        !isValidDate(startDate) ||
        !isValidDate(endDate) ||
        startDate > endDate
      ) {
        return res.status(400).json({
          status: 400,
          message: "Amount must be greater than zero and dates must be valid with startDate before endDate.",
        });
      }

      const userId = await getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 401, message: "Unauthorized." });
      }

      const budget = await Budget.create({ amount: numericAmount, startDate, endDate, userId });
      return res.status(201).json({
        status: 201,
        message: "Budget registered successfully.",
        budget: { ...budget.toJSON(), summary: await getBudgetSummary(budget) },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      const budget = await Budget.findOne({ where: { id: req.params.id, userId: userId || "" } });
      if (!budget) {
        return res.status(404).json({ status: 404, message: "Budget not found." });
      }

      const currentBudget: any = budget;
      const amount = req.body.amount === undefined ? currentBudget.amount : Number(req.body.amount);
      const startDate = req.body.startDate || currentBudget.startDate;
      const endDate = req.body.endDate || currentBudget.endDate;
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !isValidDate(startDate) ||
        !isValidDate(endDate) ||
        startDate > endDate
      ) {
        return res.status(400).json({ status: 400, message: "Invalid budget amount or dates." });
      }

      await budget.update({ amount, startDate, endDate });
      return res.status(200).json({
        status: 200,
        message: "Budget updated successfully.",
        budget: { ...budget.toJSON(), summary: await getBudgetSummary(budget) },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      const budget = await Budget.findOne({ where: { id: req.params.id, userId: userId || "" } });
      if (!budget) {
        return res.status(404).json({ status: 404, message: "Budget not found." });
      }

      await budget.destroy();
      return res.status(200).json({ status: 200, message: "Budget deleted successfully." });
    } catch (error: any) {
      return res.status(500).json({ status: 500, message: "Server error.", error: error.message });
    }
  },
};

export default BudgetController;
