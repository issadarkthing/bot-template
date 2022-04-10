import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { Player } from "../structure/Player";

export default class extends Command {
  name = "profile";
  description = "show profile";
  aliases = ["p"];

  async exec(msg: Message) {

    const player = await Player.fromUser(msg.author);
    this.sendEmbed(msg, player.show());
  }
}
