import { Weapon as BaseWeapon } from "@jiman24/discordjs-rpg";
import { Player } from "../structure/Player";
import { applyMixins, code, createSeed } from "../utils";
import { MersenneTwister19937, Random } from "random-js";
import { names } from "./WeaponData";
import { getRange, Quality, qualityNames, randomItem } from "./Quality";
import { Item } from "./Item";

export interface Weapon extends Item {};

export abstract class Weapon extends BaseWeapon {
  abstract price: number;
  abstract critDamage: number;
  abstract quality: Quality;

  static get all(): Weapon[] {
    return names.map(x => new WeaponItem(x));
  }

  apply(player: Player) {
    player.attack += this.attack;
    player.critDamage += this.critDamage;
  }

  static random() {
    const item = randomItem(this.all) as WeaponItem;
    return item;
  }
}

applyMixins(Weapon, [Item]);


class WeaponItem extends Weapon {
  id: string;
  name: string;
  price: number;
  critDamage: number;
  quality: Quality;

  constructor(name: string) {
    super();

    this.id = name;
    this.name = name;

    const random = new Random(MersenneTwister19937.seedWithArray(createSeed(name)));
    
    this.quality = random.pick(qualityNames);

    const attackRanges = getRange(10, 80, this.quality);
    const critDamage = getRange(0.1, 1, this.quality, 0.2);

    this.attack = random.integer(...attackRanges);
    this.critDamage = random.real(...critDamage, true);
    this.price = (this.attack ** 2) + random.integer(1, 100);
  }

  show() {
    const embed = super.show();
    embed.addField("Crit Damage", code(`x${this.critDamage.toFixed(1)}`), true);
    embed.addField("Quality", this.quality, true);

    return embed;
  }
};

