import bcrypt from "bcrypt";
import db from "../config/db";
import Category from "../category/Category";
import User from "../user/User";
import Wallet from "../wallet/Wallet";
import sync from "./sync";

async function seed() {
  const email = process.env.SEED_EMAIL || "demo@example.com";
  const password = process.env.SEED_PASSWORD || "change-me";
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      name: process.env.SEED_NAME || "Demo User",
      password: await bcrypt.hash(password, 10),
    },
  });

  await Promise.all([
    Category.findOrCreate({
      where: { userId: user.dataValues.id, name: "Food" },
      defaults: { budget: 0, color: "#10B981", icon: "restaurant" },
    }),
    Category.findOrCreate({
      where: { userId: user.dataValues.id, name: "Transport" },
      defaults: { budget: 0, color: "#3B82F6", icon: "directions_car" },
    }),
    Wallet.findOrCreate({
      where: { userId: user.dataValues.id, name: "Cash" },
      defaults: { purpose: "Daily spending", type: "cash", balance: 0 },
    }),
  ]);

  console.log(`Seeded demo data for ${email}.`);
}

async function main() {
  const command = process.argv[2] || "migrate";

  if (command === "migrate") {
    await sync();
    console.log("Database migration completed.");
  } else if (command === "reset") {
    await db.drop();
    await sync({ alter: false });
    console.log("Database reset completed.");
  } else if (command === "seed") {
    await sync();
    await seed();
  } else {
    throw new Error(`Unknown database command: ${command}`);
  }
}

main()
  .catch((error) => {
    console.error("Database command failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
