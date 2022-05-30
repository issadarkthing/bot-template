import { Message, MessageActionRow, MessageSelectMenu } from "discord.js";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/commandment";
import { stripIndents } from "common-tags";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";
import { MessageEmbed } from "../structure/MessageEmbed";
import { Pagination } from "@jiman24/discordjs-pagination";
import { Player } from "../structure/Player";
import { chunk, currency, toNList } from "../utils";

type ShopCategory = "armor" | "weapon" | "pet" | "skill";

export default class extends Command {
  name = "shop";
  description = "buy in-game items";

  async selectPage(msg: Message, chunkedItems: Item[][]): Promise<Item[] | null> {

    const pages = chunkedItems.map(x => {

      const embed = new MessageEmbed(msg.author)
        .setDescription(
          toNList(
            x.map(
              item => `${item.name} **${item.price} ${currency}**`)))

      return embed;
    });

    let index: null | number = null;

    const pagination = new Pagination(msg, pages);

    pagination.addCancelButton();
    pagination.setOnSelect(i => index = i);

    await pagination.run();

    return index === null ? null : chunkedItems[index];
  }

  async selectIndex(msg: Message, selectedItems: Item[]): Promise<Item | null> {

    const selectedItemEmbeds = selectedItems
      .map(x => x.show().addField("Price", x.price.toString(), true));

    let index = null;

    const itemsPagination = new Pagination(msg, selectedItemEmbeds);

    itemsPagination.addCancelButton();
    itemsPagination.setSelectText("Buy");
    itemsPagination.setOnSelect(i => index = i);

    await itemsPagination.run();

    return index === null ? null : selectedItems[index];
  }

  async exec(msg: Message) {

    const player = await Player.fromUser(msg.author);
    const categoryOptions: { label: string, value: ShopCategory }[] = [
      {
        label: "Armor",
        value: "armor",
      },
      {
        label: "Weapon",
        value: "weapon",
      },
      {
        label: "Pet",
        value: "pet",
      },
      {
        label: "Skill",
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

    const chunkedItems = chunk(items, 10);
    const selectedItems = await this.selectPage(msg, chunkedItems);

    if (selectedItems === null) return;

    const item = await this.selectIndex(msg, selectedItems);

    if (item === null) return;


    await item.buy(msg);
  }
}
