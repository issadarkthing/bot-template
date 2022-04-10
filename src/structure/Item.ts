import { Message, MessageEmbed } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { remove } from "../utils";
import { MessageEmbed as Embed } from "./MessageEmbed";

export abstract class Item {
  abstract name: string;
  abstract id: string;
  abstract price: number;
  abstract show(): MessageEmbed;
  abstract apply(player: Player): void;

  // add buttons to the menu button with their respective actions
  actions(msg: Message, menu: ButtonHandler, player: Player) {

    const embed = new Embed(msg.author);

    if (player.equippedItems.some(x => x.id === this.id)) {

      menu.addButton("unequip", () => {
        const { Pet } = require("./Pet");
        const { Skill } = require("./Skill");

        if (this instanceof Pet) {
          delete player.pet;
        } else if (this instanceof Skill) {
          delete player.skill;
        }

        player.equippedItems = remove(this, player.equippedItems);
        player.save();

        embed.setDescription(`Successfully unequipped **${this.name}**`);

      })

    } else {

      menu.addButton("equip", () => {

        const equippedKind = player.equippedItems
          .find(x => x.constructor.name === this.constructor.name);

        if (equippedKind) {
          player.equippedItems = remove(equippedKind, player.equippedItems);
          msg.channel.send(`Successfully unequipped **${equippedKind.name}**`);
        }

        player.equippedItems.push(this);
        player.save();

        embed.setDescription(`Successfully equipped **${this.name}**`);

      })
    }

    msg.channel.send({ embeds: [embed] });
  }

  async buy(msg: Message) {
    const player = await Player.fromUser(msg.author);
    const embed = new Embed(msg.author);

    if (player.coins < this.price) {
      embed.setDescription("Insufficient amount");
      msg.channel.send({ embeds: [embed] });
      return;
    }

    if (player.inventory.some(x => x.id === this.id)) {
      embed.setDescription("You already own this item");
      msg.channel.send({ embeds: [embed] });
      return;
    }

    player.coins -= this.price;
    player.inventory.push(this);

    player.save();
    embed.appendDescription(`Successfully bought **${this.name}**!`);
    embed.appendDescription(`Use command \`!inventory\` to equip item`);
    msg.channel.send({ embeds: [embed] });
  }

  static get(id: string) {
    return Item.all.find(x => x.id === id);
  }

  static get all(): Item[] {
    const { Armor } = require("./Armor");
    const { Weapon } = require("./Weapon");
    const { Pet } = require("./Pet");
    const { Skill } = require("./Skill");

    return [
      ...Armor.all,
      ...Weapon.all,
      ...Pet.all,
      ...Skill.all,
    ];
  }
}
