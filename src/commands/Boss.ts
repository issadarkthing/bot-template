import { Command } from "@jiman24/commandment";
import { Message, MessageActionRow, MessageSelectMenu } from "discord.js";
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
import { MessageEmbed } from "../structure/MessageEmbed";
import { stripIndents } from "common-tags";

export default class extends Command {
  name = "boss";
  description = "fight boss";

  async exec(msg: Message) {

    const player = await Player.fromUser(msg.author);
    const boss = Boss.all;
    const options = boss.map(x => ({ label: x.name, value: x.id }));

    const selectMenu = new MessageSelectMenu()
      .setCustomId("boss")
      .setPlaceholder("Nothing selected")
      .addOptions(options);

    const row = new MessageActionRow()
      .addComponents(selectMenu);

    const bossList = toNList(boss.map(x => x.name));
    const bossEmbed = new MessageEmbed(msg.author)
      .setDescription(
        stripIndents`Please select a boss:
        ${bossList}
        `
      );

    const message = await msg.channel.send({ embeds: [bossEmbed], components: [row] });
    const respond = await message.awaitMessageComponent({ componentType: "SELECT_MENU" });

    if (!respond.isSelectMenu()) return;

    respond.reply(`Opening boss`);
    respond.deleteReply();
    message.delete();

    const selectedBoss = boss.find(x => x.id === respond.values[0])!;
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

        player.save();

        const embed = new MessageEmbed(msg.author)
          .appendDescription(`${player.name} has earned ${bold(drop)} ${currency}!`)
          .appendDescription(`${player.name} has earned ${bold(xpDrop)} xp!`);

        this.sendEmbed(msg, embed);

        if (currLevel !== player.level) {
          embed.setDescription(`${player.name} is now on level ${bold(player.level)}!`);
          this.sendEmbed(msg, embed);
        }
      }
    })

    menu.addCloseButton();

    await menu.run();



  }
}
