import db from "../config/db";
import { DataTypes } from "sequelize";
import { UUIDV4 } from "sequelize";

export const CATEGORY_ICON_KEYS = [
  "restaurant",
  "local_cafe",
  "local_bar",
  "fastfood",
  "shopping_cart",
  "directions_car",
  "directions_bus",
  "local_taxi",
  "flight",
  "two_wheeler",
  "home",
  "bolt",
  "water_drop",
  "wifi",
  "phone_android",
  "build",
  "shopping_bag",
  "devices",
  "chair",
  "card_giftcard",
  "pets",
  "medical_services",
  "medication",
  "fitness_center",
  "spa",
  "movie",
  "sports_esports",
  "music_note",
  "luggage",
  "school",
  "child_care",
  "payments",
  "work",
  "trending_up",
  "savings",
  "account_balance",
  "credit_card",
  "redeem",
  "swap_horiz",
  "category",
];

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
    defaultValue: "category",
    validate: {
      isIn: [CATEGORY_ICON_KEYS],
    },
  },
});

export default Category;
