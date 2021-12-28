import { Fighter } from "discordjs-rpg";
import { currency } from "../utils";
import { Defense, Heal, Rage } from "../structure/Skill";
import { Phoenix, Slime, Titanoboa } from "./Pet";

export abstract class Boss extends Fighter {
  abstract drop: number;
  abstract xpDrop: number;

  static get all(): Boss[] {
    return [
      new Cavernmonster("Cavernmonster"),
      new Vortexscreamer("Vortexscreamer"),
      new Rottingseeker("Rottingseeker"),
    ];
  }

  show() {
    const embed = super.show();

    embed.addField(`${currency} Drop`, `${this.drop}`, true);
    embed.addField(`XP Drop`, `${this.xpDrop}`, true);

    return embed;
  }
}

export class Cavernmonster extends Boss {
  drop = 12000;
  xpDrop = 500;
  attack = 500;
  hp = 550;
  armor = 0.3;
  critChance = 0.1;
  critDamage = 3;
  imageUrl = "https://www.runehq.com/image/monsterdb/v/vanstromklause.png";
  
  constructor(name: string) {
    super(name);

    const skill = new Heal(); 
    skill.setOwner(this);

    const pet = new Slime()
    pet.setOwner(this);
  }
}

export class Vortexscreamer extends Boss {
  drop = 24000;
  xpDrop = 800;
  attack = 1200;
  hp = 1420;
  armor = 0.35;
  critChance = 0.2;
  critDamage = 3.4;
  imageUrl = "https://www.runehq.com/image/monsterdb/k/kriltsutsaroth.png"

  constructor(name: string) {
    super(name);

    const skill = new Rage(); 
    skill.setOwner(this);

    const pet = new Phoenix()
    pet.setOwner(this);
  }
}

export class Rottingseeker extends Boss {
  drop = 35000;
  xpDrop = 1000;
  attack = 2350;
  hp = 2570;
  armor = 0.39;
  critChance = 0.2;
  critDamage = 3.8;
  imageUrl = "https://www.runehq.com/image/monsterdb/k/kreearra.png";

  constructor(name: string) {
    super(name);

    const skill = new Defense(); 
    skill.setOwner(this);

    const pet = new Titanoboa()
    pet.setOwner(this);
  }
}

