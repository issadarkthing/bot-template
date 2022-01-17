import { Command } from "@jiman24/commandment";
import { Message, MessageEmbed } from "discord.js";
import { Boss } from "../structure/Boss";
import { Player } from "../structure/Player";
import { 
  bold, 
  currency, 
  random, 
  toNList, 
  validateIndex, 
  validateNumber,
} from "../utils";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Battle } from "@jiman24/discordjs-rpg";

export default class extends Command {
  name = "boss";
  description = "fight boss";

  async exec(msg: Message, args: string[]) {

    const player = Player.fromUser(msg.author);
    const boss = Boss.all;
    
    const [arg1] = args;
    
    if (arg1) {

      const index = parseInt(arg1) - 1;
      validateNumber(index)
      validateIndex(index, boss);

      const selectedBoss = boss[index];
      const menu = new ButtonHandler(msg, selectedBoss.show());

      menu.addButton("battle", async () => {

        const battle = new Battle(msg, random.shuffle([player, selectedBoss]));

        const winner = await battle.run();

        if (winner.id === player.id) {

          const { drop, xpDrop } = selectedBoss;

          const currLevel = player.level;
          player.addXP(xpDrop);
          player.coins += drop;
          player.win++;

          msg.channel.send(`${player.name} has earned ${bold(drop)} ${currency}!`);
          msg.channel.send(`${player.name} has earned ${bold(xpDrop)} xp!`);

          if (currLevel !== player.level) {
            msg.channel.send(`${player.name} is now on level ${bold(player.level)}!`);
          }
        }
      })

      menu.addCloseButton();

      await menu.run();

      return;
    }

    const bossList = toNList(boss.map(x => x.name));

    const embed = new MessageEmbed()
      .setColor("RED")
      .setTitle("Boss")
      .setDescription(bossList)

    msg.channel.send({ embeds: [embed] });
  }
}
