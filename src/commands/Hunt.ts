import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { Player } from "../structure/Player";
import { Battle } from "discordjs-rpg";
import { Monster } from "../structure/Monster";
import { bold, sleep } from "../utils";

export default class extends Command {
  name = "hunt";
  description = "hunt monsters";
  block = true;

  async exec(msg: Message) {

    const player = Player.fromUser(msg.author);

    const challenger = new Monster(player);
    const info = challenger.show().setTitle("Your opponent");

    const loading = await msg.channel.send({ embeds: [info] });
    await sleep(6);
    await loading.delete();

    const battle = new Battle(msg, [player, challenger]);
    const winner = await battle.run();

    if (winner.id === player.id) {

      const currLevel = player.level;
      player.addXP(challenger.xpDrop);
      player.shards += challenger.drop;
      player.save();

      msg.channel.send(`${player.name} has earned ${bold(challenger.drop)} coins!`);
      msg.channel.send(`${player.name} has earned ${bold(challenger.xpDrop)} xp!`);

      if (currLevel !== player.level) {
        msg.channel.send(`${player.name} is now on level ${bold(player.level)}!`);
      }
    } 

  }
}
