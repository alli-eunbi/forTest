import { RedisModule } from "./redis";

const express = require("express");
const app = express();
const port = 3000;

const redis = new RedisModule({
  host: "localhost",
  port: 6379,
  password: "password",
});

app.get("/health", (req, res) => {
  res.send("healthy");
});

app.get("/pod", (req, res) => {
  const ip = req.query.ip;

  res.send("healthy");
});

app.get("/health", (req, res) => {
  res.send("healthy");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
