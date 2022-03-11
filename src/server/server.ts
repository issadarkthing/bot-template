import express from "express";
import bodyParser from "body-parser";
import { router as playerRouter } from "./routes/player";
import cors from "cors";
import Josh from "@joshdb/core";
//@ts-ignore
import provider from "@joshdb/sqlite"

const PORT = process.env.PORT  || 3000;
const app = express();
export const players = new Josh({
  name: "player",
  provider,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/player", playerRouter);

app.listen(PORT, () => console.log(`listening to port ${PORT}`));
