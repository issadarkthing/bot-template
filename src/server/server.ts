import express from "express";
import bodyParser from "body-parser";
import token from "./middleware/token";
import { router as playerRouter } from "./routes/player";
import { router as inventoryRouter } from "./routes/inventory";
import cors from "cors";
import Josh from "@joshdb/core";
//@ts-ignore
import provider from "@joshdb/sqlite"

const PORT = process.env.PORT || 3000;
export const API_TOKEN = process.env.API_TOKEN;
const app = express();

if (!API_TOKEN) {
  throw new Error("you need to provide api token");
}

export const players = new Josh({
  name: "player",
  provider,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(token);

app.use("/player", playerRouter);
app.use("/inventory", inventoryRouter);

app.listen(PORT, () => console.log(`listening to port ${PORT}`));
