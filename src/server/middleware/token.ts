import { NextFunction, Request, Response } from "express";
import { API_TOKEN } from "../server";



export default function token(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    res.status(400).send("you need to provide API token");
    return;
  }

  const [, token] = authorization.split(" ");

  if (token !== API_TOKEN) {
    res.status(403).send("invalid token");
    return;
  }

  next();
}
