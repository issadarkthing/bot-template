import { Message, MessageEmbed } from "discord.js";

export abstract class Item {
  abstract name: string;
  abstract id: string;
  abstract price: number;
  abstract show(): MessageEmbed;
  abstract buy(msg: Message): void;
}
