import { Pet as BasePet } from "@jiman24/discordjs-rpg";
import { Player } from "./Player";
import { Item } from "./Item";
import { applyMixins } from "../utils";

export interface Pet extends Item {};

export abstract class Pet extends BasePet {
  abstract price: number;

  static get all(): Pet[] {
    return petData.map(x => new PetItem(x));
  }

  apply(player: Player) {
    this.setOwner(player);
  }
}

applyMixins(Pet, [Item]);

interface PetData {
  readonly id: string;
  readonly name: string;
  readonly attack: number;
  readonly price: number;
  readonly interceptRate?: number;
}

class PetItem extends Pet {
  id: string;
  name: string;
  price: number;

  constructor(data: PetData) {
    super();

    this.id = data.id;
    this.name = data.name;
    this.attack = data.attack;
    this.price = data.price;

    if (data.interceptRate) {
      this.interceptRate = data.interceptRate;
    }
  }
};

const petData: PetData[] = [
  {
    id: "blob",
    name: "Blob",
    attack: 20,
    price: 130_000,
  },
  {
    id: "slime",
    name: "Slime",
    attack: 15,
    price: 150_000,
  },
  {
    id: "phoenix",
    name: "Phoenix",
    attack: 15,
    interceptRate: 0.2,
    price: 150_000,
  },
  {
    id: "titan_o_boa",
    name: "Titan-o-boa",
    attack: 25,
    interceptRate: 0.4,
    price: 300_000,
  }
];

