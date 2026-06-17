import db from "../config/db";
import { DataTypes } from "sequelize";
import { UUIDV4 } from "sequelize";

const Category = db.define("category", {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
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
  budget: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0,
    get() {
      const value = this.getDataValue("budget");
      return value === null ? null : parseFloat(value);
    },
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "#3B82F6",
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "folder",
  },
});

export default Category;
