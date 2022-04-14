import { Message, MessageEmbed as Embed } from "discord.js";
import { Command } from "@jiman24/commandment";
import { Dungeon } from "../structure/Dungeon";
import { Pagination } from "@jiman24/discordjs-pagination";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Battle, Fighter } from "@jiman24/discordjs-rpg";
import { MessageEmbed } from "../structure/MessageEmbed";
import { oneLine, stripIndents } from "common-tags";
import { Player } from "../structure/Player";
import { bold, currency, random } from "../utils";

export default class extends Command {
  name = "dungeon";
  maxPlayers = 3;

  async exec(msg: Message) {

    const dungeons = Dungeon.all.map(x => x.show(msg.author));
    const menu = new Pagination(msg, dungeons);

    let dungeonIndex = 0;

    menu.setOnSelect((index) => { dungeonIndex = index });

    await menu.run();

    const dungeon = Dungeon.all[dungeonIndex];
    const player = await Player.fromUser(msg.author);
    const players = [player];

    const embed = new MessageEmbed(msg.author)
      .setTitle(`Dungeon ${dungeon.level}`)
      .setDescription(
        oneLine`Waiting for party to join.. (${players.length}/${this.maxPlayers} players)`
      );


    const partyMenu = new ButtonHandler(msg, embed)
      .setMultiUser(this.maxPlayers - 1);


    partyMenu.addButton("join", async user => {

      try {

        if (players.some(x => x.id === user.id)) {
          throw new Error(`already in the party`);
        }

        const player = await Player.fromUser(user);

        players.push(player);

        msg.channel.send(
          `${user.username} joined! (${players.length}/${this.maxPlayers} players)`
        );

      } catch (err) {

        const errMsg = (err as Error).message;
        const embed = new MessageEmbed(user)
          .setDescription(errMsg);

        this.sendEmbed(msg, embed);
      }


    })

    await partyMenu.run();

    const initialPlayers = [...players];

    let round = 0;
    const monsters = dungeon.getMonsters();
    const damageDealtRecord = new Map<string, number>();

    for (const monster of monsters) {

      round++;

      const roundEmbed = monster.show()
        .setTitle(`Dungeon ${dungeon.level}`)
        .setDescription(`Round: \`${round}/${monsters.length}\``);

      this.sendEmbed(msg, roundEmbed);

      const battle = new Battle(msg, random.shuffle([...players, monster]));
      battle.setInterval(500);
      battle.setBoss(monster);

      battle.setOnFighterDead((fighter) => {
        const index = players.findIndex(x => x.id === fighter.id);

        if (index === -1) {
          return;
        }

        players.splice(index, 1);
      })

      const winner = await battle.run();

      damageDealtRecord.set(monster.id, battle.getDamageDealt(monster.id) || 0);

      for (const player of players) {
        const totalDamageDealt = damageDealtRecord.get(player.id) || 0;
        const currentDamageDealt = battle.getDamageDealt(player.id) || 0;
        damageDealtRecord.set(player.id, totalDamageDealt + currentDamageDealt);
      }

      if (winner instanceof Player) {

        for (const player of players) {

          const currLevel = player.level;
          const xpDrop = Math.ceil(monster.xpDrop / players.length);
          const drop = Math.ceil(monster.drop / players.length);

          player.addXP(xpDrop);
          player.coins += drop;

          const embed = new MessageEmbed(player.user)
            .appendDescription(`${player.name} has earned ${bold(drop)} ${currency}!`)
            .appendDescription(`${player.name} has earned ${bold(xpDrop)} xp!`);

          this.sendEmbed(msg, embed);

          if (currLevel !== player.level) {
            embed.setDescription(`${player.name} is now on level ${bold(player.level)}!`);
            this.sendEmbed(msg, embed);
          }

        }

      } else {

        this.send(msg, "Dungeon venture failed");

        return;
      }

    }

    const getResult = (fighters: Fighter[]) => {
      return fighters
        .sort((a, b) => {
          const damageDealtA = damageDealtRecord.get(a.id) || 0;
          const damageDealtB = damageDealtRecord.get(b.id) || 0;

          return damageDealtB - damageDealtA;
        })
        .map(fighter => {
          const damageDealt = damageDealtRecord.get(fighter.id) || 0;
          return `${fighter.name} | **${damageDealt.toFixed(1)}**`;
        })
        .join("\n");
    };

    const playerResult = getResult(initialPlayers);
    const monsterResult = getResult(monsters);

    const winEmbed = new Embed()
      .setTitle(`Dungeon ${dungeon.level}`)
      .setColor("GOLD")
      .setDescription(stripIndents`Dungeon has been conquered!

      **Players:**
      Name | Damage Dealt
      ${playerResult}
        
      **Monsters:**
      Name | Damage Dealt
      ${monsterResult}
      `);

    this.sendEmbed(msg, winEmbed);
  }
}
