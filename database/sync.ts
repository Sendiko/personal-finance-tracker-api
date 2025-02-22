import Category from "../category/Category";
import Transaction from "../transaction/Transaction";
import User from "../user/User";
import Wallet from "../wallet/Wallet";

async function sync() {
  await User.sync()
    .then(() => {
      console.log("User Table created successfully.");
    })
    .catch((err) => {
      console.log("Error: " + err);
    });

  Wallet.belongsTo(User);
  await Wallet.sync()
    .then(() => {
      console.log("Wallet Table created successfully.");
    })
    .catch((err) => {
      console.log("Error: " + err);
    });

  Category.belongsTo(User);
  await Category.sync()
    .then(() => {
      console.log("Category Table created successfully.");
    })
    .catch((err) => {
      console.log("Error: " + err);
    });

  Transaction.belongsTo(User);
  Transaction.belongsTo(Category);
  Transaction.belongsTo(Wallet);
  await Transaction.sync()
    .then(() => {
      console.log("Transaction Table created successfully.");
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
}

export default sync;