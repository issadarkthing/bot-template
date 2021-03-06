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
      new ChanceTaker(),
      new LifeSteal(),
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
  price = 450_000;

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
  price = 550_000;
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
  price = 500_000;
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

export class ChanceTaker extends Skill {
  name = "Chance Taker";
  id = "chance_taker";
  price = 550_000;
  interceptRate = 0.10;
  critChance = 0.8;
  description = `Increases your crit chance to ${Math.round(this.critChance * 100)}% when activated (does not stack)`;

  use(p1: Fighter, _p2: Fighter) {

    const armorAmount = p1.armor * 0.1;
    p1.armor += armorAmount;

    const embed = new MessageEmbed()
      .setTitle("Skill interception")
      .setColor("GREEN")
      .setDescription(
        oneLine`${p1.name} uses **${this.name} Skill** and sets their 
        crit chance to \`${this.critChance * 100}%\``
      )

    if (this.imageUrl)
      embed.setThumbnail(this.imageUrl);

    return embed;
  }

  close(_p1: Fighter, _p2: Fighter) { }
}

export class LifeSteal extends Skill {
  name = "Life Steal";
  id = "life_steal";
  price = 625_000;
  interceptRate = 0.25;
  lifeSteal = 0.2;
  description = `Steals your opponent's hp by ${Math.round(this.lifeSteal * 100)}%`;


  use(p1: Fighter, _p2: Fighter) {

    const armorAmount = p1.armor * 0.1;
    p1.armor += armorAmount;

    const embed = new MessageEmbed()
      .setTitle("Skill interception")
      .setColor("GREEN")
      .setDescription(
        oneLine`${p1.name} uses **${this.name} Skill** and sets their 
        crit chance to \`${Math.round(this.lifeSteal * 100)}%\``
      )

    if (this.imageUrl)
      embed.setThumbnail(this.imageUrl);

    return embed;
  }

  close(_p1: Fighter, _p2: Fighter) { }
}
