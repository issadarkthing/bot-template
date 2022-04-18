import { Armor as BaseArmor } from "@jiman24/discordjs-rpg";
import { MersenneTwister19937, Random } from "random-js";
import { applyMixins, createSeed } from "../utils";
import { bootsNames, chestNames, helmetNames, leggingsNames } from "./ArmorData";
import { Item } from "./Item";
import { Player } from "./Player";
import { getRange, Quality, qualityNames } from "./Quality";

type ArmorCategory = "Helmet" | "Chest" | "Leggings" | "Boots";

export interface Armor extends Item {}

export abstract class Armor extends BaseArmor {
  abstract price: number;
  abstract quality: Quality;
  abstract category: ArmorCategory;
  static maxArmor = 4; // max armor can be equipped
  static maxTotalArmor = 0.6; // max armor percentage

  static get all(): Armor[] {
    return [
      ...helmetNames,
      ...chestNames,
      ...leggingsNames,
      ...bootsNames,
    ].map(x => new ArmorItem(x));
  }

  apply(player: Player) {
    player.armor += this.armor;
  }
}

applyMixins(Armor, [Item]);

function categorize(name: string): ArmorCategory {
  
  const isIncluded = (items: string[]) => 
    items.some(x => x === name);

  switch (true) {
    case isIncluded(helmetNames): return "Helmet";
    case isIncluded(chestNames): return "Chest";
    case isIncluded(leggingsNames): return "Leggings";
    case isIncluded(bootsNames): return "Boots";
  }

  throw new Error("cannot be categorized")
}


class ArmorItem extends Armor {
  id: string;
  name: string;
  price: number;
  quality: Quality;
  category: ArmorCategory;

  constructor(name: string) {
    super();

    this.id = name;
    this.name = name;

    const random = new Random(MersenneTwister19937.seedWithArray(createSeed(name)));
    
    this.category = categorize(name);
    this.quality = random.pick(qualityNames);

    const armorRanges = getRange(0.001, 0.01, this.quality, 0.001);

    this.armor = random.real(...armorRanges, true);
    this.price = Math.round(this.armor * 1204220) + random.integer(1, 100);
  }


  show() {
    const embed = super.show();
    embed.addField("Category", this.category, true);
    embed.addField("Quality", this.quality, true);

    return embed;
  }
};
