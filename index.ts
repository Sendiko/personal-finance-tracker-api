import express from "express";
import { Request, Response } from "express";
import router from "./src/router/route";
import { default as sync } from "./src/database/sync";
const app = express();
const port = 3000;

sync();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res) => {
  res.send("Hello World!");
});

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
