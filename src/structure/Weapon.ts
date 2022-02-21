import { Weapon as BaseWeapon } from "@jiman24/discordjs-rpg";
import { Player } from "../structure/Player";
import { Item } from "./Item";
import { applyMixins } from "../utils";

export interface Weapon extends Item {};

export abstract class Weapon extends BaseWeapon {
  abstract price: number;

  static get all(): Weapon[] {
    return [
      new Axe(),
      new Sword(),
      new Dagger(),
      new Mace(),
    ];
  }

  apply(player: Player) {
    player.attack += this.attack;
  }
}

applyMixins(Weapon, [Item]);

class Axe extends Weapon {
  id = "axe";
  name = "Axe";
  attack = 20;
  price = 1000;
}

class Sword extends Weapon {
  id = "sword";
  name = "Sword";
  attack = 30;
  price = 2000;
}

class Dagger extends Weapon {
  id = "dagger";
  name = "Dagger";
  attack = 40;
  price = 3000;
}

class Mace extends Weapon {
  id = "mace";
  name = "Mace";
  attack = 45;
  price = 3500;
}

class Blaster extends Weapon {
  id = "blaster";
  name = "Blaster";
  attack = 50;
  price = 4000;
}
