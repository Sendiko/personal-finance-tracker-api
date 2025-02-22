import { Sequelize } from "sequelize";  

import config from "./config";

const db = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  dialect: "mysql",
});

db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err: any) => console.log("Error: " + err));

export default db;
