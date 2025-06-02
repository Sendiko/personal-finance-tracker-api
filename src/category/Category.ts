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
});

export default Category;
