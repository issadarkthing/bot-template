import { CommandManager } from "@jiman24/commandment";
import { Client as DiscordClient } from "discord.js";
import Enmap from "enmap";

export class Client extends DiscordClient {
  players = new Enmap("Player");
  commandManager = new CommandManager(process.env.PREFIX || "!");
}
