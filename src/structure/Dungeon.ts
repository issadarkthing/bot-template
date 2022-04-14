import { random } from "../utils";
import { Monster } from "./Monster";
import { MessageEmbed } from "./MessageEmbed";
import { User } from "discord.js";

interface DungeonData {
  level: number;
  minLevel: number;
  maxLevel: number;
}

export class Dungeon {
  static readonly MONSTER_COUNT = 5;
  static readonly MAX_DUNGEONS = 50;
  readonly level: number;
  readonly minLevel: number;
  readonly maxLevel: number;

  constructor(dungeonData: DungeonData) {
    this.level = dungeonData.level;
    this.minLevel = dungeonData.minLevel;
    this.maxLevel = dungeonData.maxLevel;
  }

  // gets dungeon's monster min and max level
  private static getMinMax(level: number) {
    const min = ((level - 1) * 5) + 1;
    const max = level * 5;
    return [min, max] as const;
  }

  static at(level: number) {
    const [min, max] = this.getMinMax(level);

    return new Dungeon({
      level,
      minLevel: min,
      maxLevel: max,
    });
  }

  static get all() {
    const dungeons: Dungeon[] = [];

    for (let i = 1; i <= this.MAX_DUNGEONS; i++) {
      dungeons.push(Dungeon.at(i));
    }

    return dungeons;
  }

  getMonsters() {
    const [min, max] = Dungeon.getMinMax(this.level);
    const monsters: Monster[] = [];

    for (let i = 0; i < Dungeon.MONSTER_COUNT; i++) {
      const level = random.integer(min, max);
      const monster = Monster.all[level - 1];
      monsters.push(monster);
    }

    return monsters;
  }

  show(user: User) {
    const embed = new MessageEmbed(user)
      .addField("Level", this.level.toString(), true)
      .addField("Monsters Level", `${this.minLevel}-${this.maxLevel}`, true)

    return embed;
  }
}
