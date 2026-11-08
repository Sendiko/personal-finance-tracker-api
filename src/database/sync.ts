import Category from "../category/Category";
import Transaction from "../transaction/Transaction";
import User from "../user/User";
import Wallet from "../wallet/Wallet";
import Budget from "../budget/Budget";

async function sync(options: { alter?: boolean } = { alter: true }) {
  User.hasMany(Wallet);
  User.hasMany(Category);
  await User.sync(options);
  console.log("User Table created successfully.");

  Wallet.belongsTo(User);
  Wallet.hasMany(Transaction);
  await Wallet.sync(options);
  console.log("Wallet Table created successfully.");

  Category.belongsTo(User);
  Category.hasMany(Transaction);
  await Category.sync(options);
  console.log("Category Table created successfully.");

  Transaction.belongsTo(User);
  Transaction.belongsTo(Category);
  Transaction.belongsTo(Wallet);
  await Transaction.sync(options);
  console.log("Transaction Table created successfully.");

  User.hasMany(Budget);
  Budget.belongsTo(User);
  await Budget.sync(options);
  console.log("Budget Table created successfully.");
}

export default sync;