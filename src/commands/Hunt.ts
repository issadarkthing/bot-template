import { Command } from "@jiman24/commandment";
import { Message, MessageEmbed } from "discord.js";
import { Player } from "../structure/Player";
import { Battle } from "discordjs-rpg";
import { Alien } from "../structure/Monster";
import { bold, REPEAT, CROSSED_SWORD, currency } from "../utils";
import { ButtonHandler } from "../structure/ButtonHandler";

class SearchMonster extends ButtonHandler {
  player: Player;
  _msg: Message;

  constructor(msg: Message, embed: MessageEmbed | string, player: Player) {
    super(msg, embed);
    this._msg = msg;
    this.player = player;
  }

  async search(cb: (monster: Alien) => Promise<void>) {

    const monster = new Alien(this.player);
    const button = new ButtonHandler(this._msg, monster.show())

    button.addButton(REPEAT, "search again", () => this.search(cb))
    button.addButton(CROSSED_SWORD, "battle", () => cb(monster))
    button.addCloseButton();

    await button.run();
  }
}

export default class extends Command {
  name = "hunt";
  description = "start hunting";
  block = true;

  async exec(msg: Message) {

    const player = Player.fromUser(msg.author);
    const search = new SearchMonster(msg, "", player);

    await search.search(async monster => {

      const battle = new Battle(msg, [player, monster]);
      battle.interval = process.env.ENV === "DEV" ? 1000 : 3000;
      const winner = await battle.run();
      player.hunt++;

      if (winner.id === player.id) {

        const currLevel = player.level;
        player.addXP(monster.xpDrop);
        player.coins += monster.drop;
        player.win++;

        msg.channel.send(`${player.name} has earned ${bold(monster.drop)} ${currency}!`);
        msg.channel.send(`${player.name} has earned ${bold(monster.xpDrop)} xp!`);

        if (currLevel !== player.level) {
          msg.channel.send(`${player.name} is now on level ${bold(player.level)}!`);
        }
      } 

      player.save();
      this.release(player.id);

    })

  }
}
