import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { client } from "../bot";
import { MessageEmbed } from "../structure/MessageEmbed";
import { bold, currency } from "../utils";

export default class extends Command {
  name = "leaderboard";
  aliases = ["l"];
  description = "show leaderboard of rich players";

  async exec(msg: Message) {

    //@ts-ignore
    const player = (await client.players.values)
      .sort((a, b) => b.coins - a.coins)
      .map((x, i) => `${i + 1}. ${x.name} \`${x.coins}\``)
      .slice(0, 10)
      .join("\n");

    const embed = new MessageEmbed(msg.author)
      .setColor("RANDOM")
      .setTitle("Leaderboard")
      .setDescription(bold(`Name | ${currency}\n`) + player);

    this.sendEmbed(msg, embed);
  }
}

