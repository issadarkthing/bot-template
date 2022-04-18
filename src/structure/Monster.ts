import { Fighter } from "@jiman24/discordjs-rpg";
import { code, currency } from "../utils";
import { Skill } from "./Skill";
import { Pet } from "./Pet";
import { MersenneTwister19937, Random } from "random-js";
import { monsterNames } from "./MonsterData";
import { Player } from "./Player";

let monsters: Monster[] = [];

export class Monster extends Fighter {
  drop: number;
  xpDrop: number;
  difficulty: number;
  private enableImage = false;
  private random: Random;
  
  constructor(name: string, imageUrl: string, index: number) {
    super(name);
    const SEED = index;
    this.random = new Random(MersenneTwister19937.seed(SEED));
    this.difficulty = index + 1;

    if (this.enableImage) {
      this.imageUrl = imageUrl;
    }

    this.hp += index * 8 + this.randomAttrib();
    this.attack += index * 2 + this.randomAttrib();
    this.critDamage += index * 0.01;
    this.armor += (this.randomAttrib() / 1000);
    this.critChance += (this.randomAttrib() / 1000);
    this.drop = (this.difficulty * 10)
    this.xpDrop = (this.difficulty * 3)

    if (this.difficulty > 50) {
      const pet = this.random.pick(Pet.all);
      pet.setOwner(this);
    }

    if (this.difficulty > 100) {
      const skill = this.random.pick(Skill.all);
      skill.setOwner(this);
    }

  }

  private randomAttrib() {
    return this.random.integer(-5, this.difficulty);
  }

  static get all() {
    if (monsters.length === 0) {
      monsters = monsterNames.map((x, i) => new Monster(x.name, x.url, i));
    }

    return monsters;
  }

  show(player?: Player) {
    const profile = super.show(player);

    profile.addField(`${currency} Drop`, code(this.drop), true);
    profile.addField("xp Drop", code(this.xpDrop), true);

    return profile;
  }
}
