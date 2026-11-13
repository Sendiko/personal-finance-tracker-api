import { DataTypes } from "sequelize";
import { UUIDV4 } from "sequelize";
import db from "../config/db";

const Transfer = db.define("transfer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue("amount");
      return value === null ? null : parseFloat(value);
    },
  },
  sourceWalletId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "wallets",
      key: "id",
    },
  },
  destinationWalletId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "wallets",
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
}, { paranoid: true });

export default Transfer;
