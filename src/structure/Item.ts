import { Message, MessageEmbed } from "discord.js";
import { Armor } from "./Armor";

export abstract class Item {
  abstract name: string;
  abstract id: string;
  abstract price: number;
  abstract show(): MessageEmbed;
  abstract buy(msg: Message): void;
  static get all() {
    return [
      ...Armor.all,
    ];
  }
}
