import { Message, MessageActionRow, MessageSelectMenu } from "discord.js";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/commandment";
import { stripIndents } from "common-tags";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";
import { MessageEmbed } from "../structure/MessageEmbed";
import { Pagination } from "../structure/Pagination";
import { Player } from "../structure/Player";
import { currency } from "../utils";
import { ButtonHandler } from "@jiman24/discordjs-button";

type ShopCategory = "armor" | "weapon" | "pet" | "skill";

export default class extends Command {
  name = "shop";
  description = "buy in-game items";

  async exec(msg: Message) {

    const player = await Player.fromUser(msg.author);
    const categoryOptions: { 
        label: string, 
        description: string, 
        value: ShopCategory,
    }[] = [
      {
        label: "Armor",
        description: "Increases your armor and HP",
        value: "armor",
      },
      {
        label: "Weapon",
        description: "Increases your attack and crit damage",
        value: "weapon",
      },
      {
        label: "Pet",
        description: "Attacks your opponent at random times",
        value: "pet",
      },
      {
        label: "Skill",
        description: "Activates during battle",
        value: "skill",
      }
    ];

    const categorySelectMenu = new MessageSelectMenu()
      .setCustomId("shop")
      .setPlaceholder("Nothing selected")
      .addOptions(categoryOptions);

    const row = new MessageActionRow()
      .addComponents(categorySelectMenu);


    const categoryEmbed = new MessageEmbed(msg.author)
      .setDescription(
        stripIndents`Please select a category:
        Armor
        Weapon
        Pet
        Skill
        `
      );

    const message = await msg.channel.send({ embeds: [categoryEmbed], components: [row] });
    const respond = await message.awaitMessageComponent({ componentType: "SELECT_MENU" });
    let items = [] as Item[];

    if (respond.isSelectMenu()) {

      switch (respond.values[0]) {
        case "armor": items = Armor.all; break;
        case "weapon": items = Weapon.all; break;
        case "pet": items = Pet.all; break;
        case "skill": items = Skill.all; break;
      }

      // limit items to player's level
      items = items
        .sort((a, b) => a.price - b.price)
        .slice(0, player.level * 100);
    }

    respond.reply(`Opening catalogue`);
    respond.deleteReply();
    message.delete();

    if (items.length === 0) return;

    const pagination = new Pagination({ 
      msg, 
      items, 
      enableSkip: true,
      skipCount: 30,
      toLabel: (x) => `${x.name} **(${x.price} ${currency})**`
    });

    let selectedItem: null | Item = null;

    pagination.onSelect = (item) => {
      selectedItem = item;
    }

    await pagination.run();

    if (!selectedItem) return;

    const item = selectedItem as Item;
    const itemEmbed = item.show();

    itemEmbed.addField("Price", `${item.price.toString()} ${currency}`, true);

    const button = new ButtonHandler(msg, itemEmbed);

    let buy = false;

    button.addButton("buy", () => { buy = true; });
    button.addCloseButton();

    await button.run();

    if (buy) {
      await item.buy(msg);
    }
  }
}
