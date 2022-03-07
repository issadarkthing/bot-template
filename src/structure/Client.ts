import { CommandManager } from "@jiman24/commandment";
import { Client as DiscordClient } from "discord.js";
import Josh from "@joshdb/core";
//@ts-ignore
import provider from "@joshdb/sqlite";
import { Player } from "./Player";

export class Client extends DiscordClient {
  players = new Josh<Player>({ name: "Player", provider });
  commandManager = new CommandManager(process.env.PREFIX || "!");
}
