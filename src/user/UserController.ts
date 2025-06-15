import { Request, Response } from "express";
import User from "./User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/config";
import Wallet from "../wallet/Wallet";
import Transaction from "../transaction/Transaction";

const UserController = {
  getByEmail: async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({
          status: 400,
          message: "Email query parameter is required.",
        });
      }

      const user = await User.findOne({
        where: { email },
        attributes: ["id", "name", "email"],
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "User fetched successfully.",
        user: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },

  // ...other methods...
  index: async (req: Request, res: Response) => {
    try {
      const users = await User.findAll();

      return res.status(200).json({
        status: 200,
        message: "Users sent successfully.",
        users: users,
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
      const user = await User.findOne({
        where: { id: req.params.id },
        include: { all: true },
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "User sent successfully.",
        user: user,
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
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
      });

      return res.status(201).json({
        status: 201,
        message: "User registered successfully.",
        user: user,
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
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      // If password is being updated, hash it before saving
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      await user.update(req.body);

      return res.status(200).json({
        status: 200,
        message: "User updated successfully.",
        user: user
      })
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
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      await user.destroy();
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        where: {
          name: req.body.name,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      // @ts-ignore User can't be null
      const match = await bcrypt.compare(req.body.password, user.password);

      if (!match) {
        return res.status(401).json({
          status: 401,
          message: "Invalid password.",
        });
      }

      // @ts-ignore User can't be null
      const token = jwt.sign({ name: user.name }, `${config.jwt}`);

      await user.update({ token: token });

      return res.status(200).json({
        status: 200,
        message: "User logged in successfully.",
        user: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message,
      });
    }
  },
  statistics: async (req: Request, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });        
      }
      
      const wallets = await Wallet.findAll({
        // @ts-ignore: User can't be null
        where: { userId: user!!.id },
      })

      const transactions = await Transaction.findAndCountAll({
        // @ts-ignore: User has id
        where: { userId: user!!.id },
      })

      return res.status(200).json({
        status: 200,
        message: "Statistics sent successfully sent.",
        wallets: wallets,
        transactions: transactions,
      })

    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Server error.",
        error: error.message
      })
    }
  },

};

export default UserController;
