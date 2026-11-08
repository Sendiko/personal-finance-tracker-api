import db from "../config/db";
import { DataTypes } from "sequelize";
import { UUIDV4 } from "sequelize";

const Budget = db.define("budget", {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    get() {
      const value = this.getDataValue("amount");
      return value === null ? null : parseFloat(value);
    },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

export default Budget;
