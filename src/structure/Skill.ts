import { Fighter, Skill as BaseSkill } from "@jiman24/discordjs-rpg";
import { MessageEmbed } from "discord.js";
import { oneLine } from "common-tags";
import { formatPercent, code, applyMixins } from "../utils";
import { Player } from "./Player";
import { Item } from "./Item";

export interface Skill extends Item {};

export abstract class Skill extends BaseSkill {
  abstract price: number;

  static get all(): Skill[] {
    return [
      new Rage(),
      new Heal(),
      new Defense(),
    ];
  }

  apply(player: Player) {
    this.setOwner(player);
  }
}

applyMixins(Skill, [Item]);

export class Rage extends Skill {
  name = "Rage";
  id = "rage";
  description = "Does double damage when activated temporarily";
  price = 45_000;

  use(p1: Fighter, _p2: Fighter) {

    p1.attack *= 2;

    const embed = new MessageEmbed()
      .setTitle("Skill interception")
      .setColor("GREEN")
      .setDescription(
        oneLine`${p1.name} uses **${this.name} Skill** and increases their
        strength to ${code(p1.attack)}!`
      )

    if (this.imageUrl)
      embed.setThumbnail(this.imageUrl);

    return embed;
  }

  close(p1: Fighter, _p2: Fighter) {
    p1.attack /= 2;
  }
}

export class Heal extends Skill {
  name = "Heal";
  id = "heal";
  description = "Heals 20% of hp when activated";
  price = 55_000;
  interceptRate = 0.1;

  use(p1: Fighter, _p2: Fighter) {

    const healAmount = Math.ceil(p1.hp * 0.2);
    p1.hp += healAmount;

    const embed = new MessageEmbed()
      .setTitle("Skill interception")
      .setColor("GREEN")
      .setDescription(
        oneLine`${p1.name} uses **${this.name} Skill** and heals
        ${code(healAmount)}HP !`
      )

    if (this.imageUrl)
      embed.setThumbnail(this.imageUrl);

    return embed;
  }

  close(_p1: Fighter, _p2: Fighter) {}
}


export class Defense extends Skill {
  name = "Defense";
  id = "defense";
  description = "Increase armor for 10% when activated";
  price = 50_000;
  interceptRate = 0.25;

  use(p1: Fighter, _p2: Fighter) {

    const armorAmount = p1.armor * 0.1;
    p1.armor += armorAmount;

    const embed = new MessageEmbed()
      .setTitle("Skill interception")
      .setColor("GREEN")
      .setDescription(
        oneLine`${p1.name} uses **${this.name} Skill** and increases
        ${code(formatPercent(armorAmount))}armor !`
      )

    if (this.imageUrl)
      embed.setThumbnail(this.imageUrl);

    return embed;
  }

  close(_p1: Fighter, _p2: Fighter) { }
}
