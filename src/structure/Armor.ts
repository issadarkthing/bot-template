import { Armor as BaseArmor } from "@jiman24/discordjs-rpg";
import assert from "assert/strict";
import { applyMixins } from "../utils";
import { Item } from "./Item";
import { Player } from "./Player";

export interface Armor extends Item {}

export abstract class Armor extends BaseArmor {
  abstract price: number;
  static maxArmor = 4; // max armor can be equipped
  static maxTotalArmor = 0.6; // max armor percentage

  static get all(): Armor[] {
    return [
      new Helmet(),
      new ChestPlate(),
      new Leggings(),
      new Boots(),
    ];
  }

  apply(player: Player) {
    player.armor += this.armor;
  }
}

applyMixins(Armor, [Item]);

export class Helmet extends Armor {
  id = "helmet";
  name = "Helmet";
  price = 8500;
  armor = 0.005;
}

export class ChestPlate extends Armor {
  id = "chest_plate";
  name = "Chest Plate";
  price = 5000;
  armor = 0.006;
}

export class Leggings extends Armor {
  id = "leggings";
  name = "Leggings";
  price = 4500;
  armor = 0.008;
}

export class Boots extends Armor {
  id = "boots";
  name = "Boots";
  price = 5500;
  armor = 0.011;
}

const totalTopArmor = Armor.all
  .sort((a, b) => b.armor - a.armor)
  .slice(0, Armor.maxArmor)
  .reduce((acc, armor) => acc + armor.armor, 0);

assert(
  totalTopArmor <= Armor.maxTotalArmor, 
  `Top ${Armor.maxArmor} armor item exceeds ${Armor.maxTotalArmor} armor attribute`
);

