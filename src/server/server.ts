import express from "express";
import bodyParser from "body-parser";
import token from "./middleware/token";
import { router as playerRouter } from "./routes/player";
import { router as inventoryRouter } from "./routes/inventory";
import cors from "cors";
import Josh from "@joshdb/core";
//@ts-ignore
import JoshProvider from "@joshdb/sqlite"


let PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "test") {
  PORT = 4000;
}

export const API_TOKEN = process.env.API_TOKEN;
export const app = express();

if (!API_TOKEN) {
  throw new Error("you need to provide api token");
}

const dataDir = process.env.NODE_ENV === "test" ? "./test-data" : undefined;

export const players = new Josh({
  name: "player",
  provider: JoshProvider,
  providerOptions: { dataDir },
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(token);

app.use("/player", playerRouter);
app.use("/inventory", inventoryRouter);

app.listen(PORT, () => console.log(`listening to port ${PORT}`));
