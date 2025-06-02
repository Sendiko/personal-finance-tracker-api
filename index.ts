import express from "express";
import { Request, Response } from "express";
import router from "./src/router/route";
import { default as sync } from "./src/database/sync";
const path = require("path");
const app = express();
const port = 3001;

sync();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
