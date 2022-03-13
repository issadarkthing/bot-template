import express, { NextFunction, Response } from "express";
import { players } from "../server";
import { playerMiddleware } from "./player";
import { Item } from "../../structure/Item";
import { remove } from "../../utils";

export const router = express.Router();

interface InventoryEntry {
  id: string;
  name: string;
  ownerID: string;
}

interface IItem {
  id: string;
  name: string;
}

interface IPlayer {
  id: string;
  name: string;
  coin: number;
  level: number;
  xp: number;
  win: number;
  hunt: number;
  currentMonster: number;
  inventory: IItem[];
}

export function bodyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    res.status(400).send("no body given");
  } else {
    next();
  }
}

router.get("/", async (req, res) => {

  const allPlayers = await players.values as IPlayer[];
  const inventories = allPlayers.map(player => {
    return player.inventory.map(x => ({ id: x.id, name: x.name, ownerID: player.id }));
  }).flat() as InventoryEntry[];

  res.json(inventories);

});

router.use("/:id", playerMiddleware);

router.get("/:id", (req, res) => {

  const inventories = res.locals.player
    .inventory
    .map((x: IPlayer) => ({ id: x.id, name: x.name }));

  res.json(inventories);
});

//@ts-ignore
router.post("/:id", bodyMiddleware);

router.post("/:id", async (req, res) => {

  const player = res.locals.player as IPlayer;
  const { id } = req.body;
  const item = Item.get(id);

  if (!item) {
    res.status(404).send("item not found");
    return;
  }

  player.inventory.push(item);

  await players.set(player.id, player);

  res.json(item);
});

router.delete("/:id/:itemID", async (req, res) => {

  const player = res.locals.player as IPlayer;
  const { itemID } = req.params;
  const item = Item.get(itemID);

  if (!item) {
    res.status(404).send("item not found");
    return;
  } else if (!player.inventory.some(x => x.id === itemID)) {
    res.status(404).send("player does not own the item");
    return;
  }

  player.inventory = remove(item, player.inventory);

  await players.set(player.id, player);

  res.json(item);
  
})
