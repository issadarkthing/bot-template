import { Message, MessageEmbed } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { remove } from "../utils";
import { MessageEmbed as Embed } from "./MessageEmbed";
import type { Armor as ArmorType } from "./Armor";

let items: Item[] = [];

export abstract class Item {
  abstract name: string;
  abstract id: string;
  abstract price: number;
  abstract show(): MessageEmbed;
  abstract apply(player: Player): void;

  // add buttons to the menu button with their respective actions
  actions(msg: Message, menu: ButtonHandler, player: Player) {

    const embed = new Embed(msg.author);
    const item = this;

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
        msg.channel.send({ embeds: [embed] });

      })

    } else {

      menu.addButton("equip", () => {
        const { Armor } = require("./Armor");

        if (item instanceof Armor) {

          const equippedCategory = player.equippedItems
            .find(x => {
              if (x instanceof Armor) {
                //@ts-ignore
                return x.category === item.category;
              }

              return false;
            });

          if (equippedCategory) {
            player.equippedItems = remove(equippedCategory, player.equippedItems);
            msg.channel.send(`Successfully unequipped **${equippedCategory.name}**`);
          }

        } else {
          const equippedKind = player.equippedItems
            .find(x => x.constructor.name === this.constructor.name);

          if (equippedKind) {
            player.equippedItems = remove(equippedKind, player.equippedItems);
            msg.channel.send(`Successfully unequipped **${equippedKind.name}**`);
          }
        }

        player.equippedItems.push(this);
        player.save();

        embed.setDescription(`Successfully equipped **${this.name}**`);
        msg.channel.send({ embeds: [embed] });

      })
    }

  }

  async buy(msg: Message) {
    const player = await Player.fromUser(msg.author);
    const embed = new Embed(msg.author);

    if (player.coins < this.price) {
      embed.setDescription("Insufficient amount");
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
    if (items.length === 0) {
      const { Armor } = require("./Armor");
      const { Weapon } = require("./Weapon");
      const { Pet } = require("./Pet");
      const { Skill } = require("./Skill");

      items = [
        ...Armor.all,
        ...Weapon.all,
        ...Pet.all,
        ...Skill.all,
      ];
    }

    return items;
  }
}
