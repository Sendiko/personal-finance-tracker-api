import { Request, Response } from "express";
import { Op } from "sequelize";
import Transaction from "../transaction/Transaction";
import Category from "../category/Category";
import User from "../user/User";

const AnalysisController = {
  getSpendingAnalysis: async (req: Request, res: Response) => {
    try {
      // @ts-ignore req.user populated by authMiddleware
      const userName = req.user;
      const user = await User.findOne({ where: { name: userName.name } });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      const userId = user.dataValues.id;

      // 1. Calculate Date Range for main breakdown
      let startDateObj: Date;
      let endDateObj: Date;
      const rangeType = (req.query.range as string) || "month";

      if (rangeType === "week") {
        const today = new Date();
        const day = today.getDay(); // 0 is Sunday, 1 is Monday...
        // Start week on Monday
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        startDateObj = new Date(today.setDate(diff));
        startDateObj.setHours(0, 0, 0, 0);

        endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 6);
        endDateObj.setHours(23, 59, 59, 999);
      } else if (rangeType === "custom") {
        if (req.query.startDate && req.query.endDate) {
          startDateObj = new Date(req.query.startDate as string);
          startDateObj.setHours(0, 0, 0, 0);

          endDateObj = new Date(req.query.endDate as string);
          endDateObj.setHours(23, 59, 59, 999);
        } else {
          // Fallback to month
          const today = new Date();
          startDateObj = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
          endDateObj = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        }
      } else {
        // Default to "month"
        const today = new Date();
        startDateObj = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        endDateObj = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // 2. Query transactions for the range
      const rangeTransactions = await Transaction.findAll({
        where: {
          userId,
          type: "expense",
          createdAt: {
            [Op.between]: [startDateObj, endDateObj],
          },
        },
        include: [Category],
      });

      // 3. Query all user categories to initialize breakdown
      const categoriesObj = await Category.findAll({
        where: { userId },
      });

      const categoryMap: { [key: string]: any } = {};
      for (const cat of categoriesObj) {
        categoryMap[cat.dataValues.id] = {
          id: cat.dataValues.id,
          name: cat.dataValues.name,
          color: cat.dataValues.color || "#3B82F6",
          icon: cat.dataValues.icon || "folder",
          amount: 0,
          budget: parseFloat(cat.dataValues.budget || 0),
          percentageOfTotal: 0,
          percentageOfBudget: 0,
        };
      }

      let totalSpending = 0;
      for (const tx of rangeTransactions) {
        // @ts-ignore
        const amount = parseFloat(tx.amount || 0);
        totalSpending += amount;

        // @ts-ignore
        const catId = tx.categoryId;
        if (categoryMap[catId]) {
          categoryMap[catId].amount += amount;
        } else {
          categoryMap[catId] = {
            id: catId,
            // @ts-ignore
            name: tx.category?.name || "Other",
            // @ts-ignore
            color: tx.category?.color || "#9CA3AF",
            // @ts-ignore
            icon: tx.category?.icon || "folder",
            amount: amount,
            // @ts-ignore
            budget: parseFloat(tx.category?.budget || 0),
            percentageOfTotal: 0,
            percentageOfBudget: 0,
          };
        }
      }

      const categoriesList = Object.values(categoryMap);
      for (const item of categoriesList) {
        item.amount = parseFloat(item.amount.toFixed(2));
        if (totalSpending > 0) {
          item.percentageOfTotal = parseFloat(((item.amount / totalSpending) * 100).toFixed(1));
        }
        if (item.budget > 0) {
          item.percentageOfBudget = parseFloat(((item.amount / item.budget) * 100).toFixed(1));
        }
      }

      // Sort by amount descending
      categoriesList.sort((a, b) => b.amount - a.amount);

      // 4. Generate 6 Months History and MoM percentage
      const monthsList: Array<{ name: string; month: number; year: number; amount: number }> = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        monthsList.push({
          name: monthNames[d.getMonth()],
          month: d.getMonth(),
          year: d.getFullYear(),
          amount: 0,
        });
      }

      const startOfHistory = new Date(monthsList[0].year, monthsList[0].month, 1, 0, 0, 0, 0);
      const endOfHistory = new Date(monthsList[5].year, monthsList[5].month + 1, 0, 23, 59, 59, 999);

      const historyTransactions = await Transaction.findAll({
        where: {
          userId,
          type: "expense",
          createdAt: {
            [Op.between]: [startOfHistory, endOfHistory],
          },
        },
      });

      for (const tx of historyTransactions) {
        // @ts-ignore
        const txDate = new Date(tx.createdAt);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();

        const monthData = monthsList.find((m) => m.month === txMonth && m.year === txYear);
        if (monthData) {
          // @ts-ignore
          monthData.amount += parseFloat(tx.amount || 0);
        }
      }

      // Format history response
      const historyMonths = monthsList.map((m) => ({
        month: m.name,
        amount: parseFloat(m.amount.toFixed(2)),
      }));

      const currentMonthAmount = monthsList[5].amount;
      const prevMonthAmount = monthsList[4].amount;
      let momChangePercentage = 0;

      if (prevMonthAmount > 0) {
        momChangePercentage = parseFloat(
          (((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100).toFixed(1)
        );
      } else if (currentMonthAmount > 0) {
        momChangePercentage = 100.0;
      }

      return res.status(200).json({
        status: 200,
        message: "Spending analysis fetched successfully.",
        data: {
          totalSpending: parseFloat(totalSpending.toFixed(2)),
          range: {
            type: rangeType,
            startDate: startDateObj.toISOString(),
            endDate: endDateObj.toISOString(),
          },
          categories: categoriesList,
          history: {
            momChangePercentage,
            months: historyMonths,
          },
        },
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

export default AnalysisController;
