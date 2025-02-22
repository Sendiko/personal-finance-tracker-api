import { DataTypes } from "sequelize";
import db from "../config/db";
import { UUIDV4 } from "sequelize";

const Wallet = db.define("wallet", {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("card", "e-money", "cash"),
    allowNull: false,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users", // name of the target model
      key: "id", // key in the target model that we're referencing
    },
  },
});

export default Wallet;