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
    return armorData.map(x => new ArmorItem(x));
  }

  apply(player: Player) {
    player.armor += this.armor;
  }
}

applyMixins(Armor, [Item]);


interface ArmorData {
  readonly id: string;
  readonly name: string;
  readonly armor: number;
  readonly price: number;
}

class ArmorItem extends Armor {
  id: string;
  name: string;
  price: number;

  constructor(data: ArmorData) {
    super();

    this.id = data.id;
    this.name = data.name;
    this.armor = data.armor;
    this.price = data.price;
  }
};

const armorData: ArmorData[] = [
  {
    id: "helmet",
    name: "Helmet",
    price: 4500,
    armor: 0.005,
  },
  {
    id: "chest_plate",
    name: "Chest Plate",
    price: 5500,
    armor: 0.006,
  },
  {
    id: "leggings",
    name: "Leggings",
    price: 6500,
    armor: 0.007,
  },
  {
    id: "boots",
    name: "Boots",
    price: 7500,
    armor: 0.008,
  },
];


const totalTopArmor = Armor.all
  .sort((a, b) => b.armor - a.armor)
  .slice(0, Armor.maxArmor)
  .reduce((acc, armor) => acc + armor.armor, 0);

assert(
  totalTopArmor <= Armor.maxTotalArmor, 
  `Top ${Armor.maxArmor} armor item exceeds ${Armor.maxTotalArmor} armor attribute`
);

