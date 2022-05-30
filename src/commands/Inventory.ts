import { Command, CommandError } from "@jiman24/commandment";
import { Prompt } from "@jiman24/discordjs-prompt";
import { Message } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { aggregate, bold, chunk, currency, DIAMOND, remove, toNList, validateIndex, validateNumber } from "../utils";
import { MessageEmbed } from "../structure/MessageEmbed";
import { Pagination } from "../structure/Pagination";
import { Item } from "../structure/Item";

export default class extends Command {
  name = "inventory";
  description = "show player's inventory";
  aliases = ["i", "inv"];
  maxWeapon = 2; // max equipped weapon
  chunk = 10;

  private getSellingPrice(price: number) {
    return Math.ceil(price / 5);
  }

  async exec(msg: Message) {

    const player = await Player.fromUser(msg.author);

    if (player.inventory.length === 0) {
      throw new CommandError("You have empty inventory");
    }

    const aggregatedItems = aggregate(player.inventory);

    const pagination = new Pagination({
      msg,
      items: aggregatedItems.map(x => x.value),
      toLabel: item => {
        const count = aggregatedItems.find(x => x.value.id === item.id)!.count;

        if (player.equippedItems.some(x => x.id === item.id)) {
          return `${DIAMOND} ${item.name} x${count}`;
        }

        return `${item.name} x${count}`;
      }
    });

    let selectedItem: null | Item = null;

    pagination.onSelect = item => {
      selectedItem = item;
    }

    await pagination.run();

    if (!selectedItem) return;

    const item = selectedItem as Item;
    const itemMenu = item.show();
    const sellingPrice = this.getSellingPrice(item.price);
    const count = aggregatedItems.find(x => x.value.id === item.id)!.count;

    itemMenu.addField("Count", `x${count}`, true);
    itemMenu.addField("Selling Price", sellingPrice.toString(), true)

    const itemButton = new ButtonHandler(msg, itemMenu);

    item.actions(msg, itemButton, player);

    let sell = false;

    itemButton.addButton("sell", () => { sell = true });

    itemButton.addCloseButton();

    await itemButton.run();


    if (sell) {

      const prompt = new Prompt(msg);
      const answer = await prompt.ask("How many units you want to sell: ");
      const unit = parseInt(answer);

      validateNumber(unit);
      if (unit <= 0) {
        throw new CommandError("You can only sell 1 unit or more");
      } else if (unit > count) {
        throw new CommandError("Insufficient unit");
      }

      const totalPrice = unit * sellingPrice;
      const countInInventory = player.inventory.filter(x => x.id === item.id).length;
      const isEquipped = player.equippedItems.some(x => x.id === item.id);

      if (countInInventory === unit && isEquipped) {
        player.equippedItems = remove(item, player.equippedItems);
        this.send(msg, `Successfully unequipped ${bold(item.name)}`);
      }

      player.inventory = remove(item, player.inventory, unit);
      player.coins += totalPrice;
      player.save();

      this.send(msg, `Successfully sold **x${unit} ${item.name}** for ${bold(totalPrice)} ${currency}!`);
    }

  }
}
