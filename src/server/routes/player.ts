import express, { NextFunction, Request, Response } from "express";
import { players } from "../server";

export type Obj = Record<string, any>;

export const router = express.Router();

export async function playerMiddleware(req: Request, res: Response, next: NextFunction) {
  const player = await players.get(req.params.id);

  if (!player) {
    res.status(404).send("cannot find player");
    return;
  } 

  res.locals.player = player;

  next();
}

router.use("/:id", playerMiddleware);

router.get("/", async (req, res) => {

  const allPlayers = (await players.values as Obj[]).map(x => removeObjectAndArrayFields(x));

  res.json(allPlayers);

})

router.get("/:id", (req, res) => {
  res.json(removeObjectAndArrayFields(res.locals.player));
});

function removeObjectAndArrayFields(obj: Obj) {
  let entries = Object.entries(obj);
  entries = entries.filter(([, value]) => typeof value !== "object");

  return Object.fromEntries(entries);
}

function areFieldsExists(target: Obj, ref: Obj) {

  for (const key of Object.keys(target)) {
    if (!ref[key]) {
      return false;
    }
  }

  return true;
}


function fieldCheck(req: Request, res: Response, next: NextFunction) {
  const body = removeObjectAndArrayFields(req.body);
  const isValidBody = areFieldsExists(body, { ...res.locals.player });

  if (!isValidBody) {
    res.status(422).send("invalid body");
  } else {
    req.body = body;
    next();
  }
}

function FreezeFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    
    const bodyFields = Object.keys(req.body);

    if (bodyFields.some(field => fields.includes(field))) {
      res.status(401).send("this field is not editable");
    } else {
      next();
    }
  }
}

const freezeFields = FreezeFields(["id", "imageUrl"]);

router.patch("/:id/", fieldCheck, freezeFields, async (req, res) => {

  const merged = { ...res.locals.player, ...req.body };

  players.set(req.params.id, merged);

  res.json(merged);

});
