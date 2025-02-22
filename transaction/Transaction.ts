import db from "../config/db";
import { DataTypes } from "sequelize";
import { UUIDV4 } from "sequelize";

const Transaction = db.define("transaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "categories",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "wallets",
      key: "id",
    },
  },
});

export default Transaction;