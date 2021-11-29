import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { client } from "../index";

export default class extends Command {
  name = "test";
  aliases = ["t"];

  async exec(msg: Message) {
    client.players.delete(msg.author.id);
    msg.channel.send("character deleted successfully");
  }
}
