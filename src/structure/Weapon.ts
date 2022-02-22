import { Weapon as BaseWeapon } from "@jiman24/discordjs-rpg";
import { Player } from "../structure/Player";
import { Item } from "./Item";
import { applyMixins } from "../utils";

export interface Weapon extends Item {};

export abstract class Weapon extends BaseWeapon {
  abstract price: number;

  static get all(): Weapon[] {
    return weaponData.map(x => new WeaponItem(x));
  }

  apply(player: Player) {
    player.attack += this.attack;
  }
}

applyMixins(Weapon, [Item]);


interface WeaponData {
  readonly id: string;
  readonly name: string;
  readonly attack: number;
  readonly price: number;
}

class WeaponItem extends Weapon {
  id: string;
  name: string;
  price: number;

  constructor(data: WeaponData) {
    super();

    this.id = data.id;
    this.name = data.name;
    this.attack = data.attack;
    this.price = data.price;
  }
};

const weaponData: WeaponData[] = [
  {
    id: "axe",
    name: "Axe",
    attack: 20,
    price: 1000,
  },
  {
    id: "sword",
    name: "Sword",
    attack: 30,
    price: 2000,
  },
  {
    id: "dagger",
    name: "Dagger",
    attack: 40,
    price: 3000,
  },
  {
    id: "mace",
    name: "Mace",
    attack: 50,
    price: 4000,
  },
];

