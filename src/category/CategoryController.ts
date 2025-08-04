import { Request, Response } from "express";
import Transaction from "../transaction/Transaction";
import Category from "./Category";
import { log } from "console";
import User from "../user/User";

const CategoryController = {
  index: async (req: Request, res: Response) => {
    try {
      // @ts-ignore User comes from middleware
      const userName = req.user;
      const user = await User.findOne({where: { name: userName.name }});
      const categories = await Category.findAll(
        {
          where: { userId: user?.dataValues.id },
          include: Transaction
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Categories sent successfully.",
        categories: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      })
    }
  },
  show: async (req: Request, res: Response) => {
    try {
      const category = await Category.findOne({
        where: { userId: req.params.id },
        include: Transaction
      });

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category not found.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Category sent successfully.",
        category: category,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      })
    }
  },
  store: async (req: Request, res: Response) => {
    try {
      const category = await Category.create(req.body);

      return res.status(201).json({
        status: 201,
        message: "Category registered successfully.",
        category: category,
      })
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      })
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category not found.",
        });
      }

      await category.update(req.body);

      return res.status(200).json({
        status: 200,
        message: "Category updated successfully.",
        category: category,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      })
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category not found.",
        });
      }

      await category.destroy();

      return res.status(200).json({
        status: 200,
        message: "Category deleted successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      })
    }
  },
};

export default CategoryController;