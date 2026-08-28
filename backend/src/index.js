import express from "express";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import {auth} from './lib/auth.js'
import { friendRouter } from "./modules/friend/friend.routes.js";

const app = express();

app.all("/api/auth/{*any}", toNodeHandler(auth));
// Mount body-parsing middleware after the Better Auth handler.
app.use(express.json());

app.use("/api/friend", friendRouter)

app.get("/", (req, res) => {
  res.send("Hello World from backend");
});

app.listen(3000, () => {
  console.log("Server is running at 3000");
});
