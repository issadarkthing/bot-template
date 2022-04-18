import { Command, CommandError } from "@jiman24/commandment";
import { Prompt } from "@jiman24/discordjs-prompt";
import { Message } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { aggregate, bold, chunk, currency, DIAMOND, remove, toNList, validateIndex, validateNumber } from "../utils";
import { MessageEmbed } from "../structure/MessageEmbed";
import { Pagination } from "@jiman24/discordjs-pagination";

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
    const inventory = aggregate(player.inventory);
    const chunkedInventory = chunk(inventory, this.chunk);

    const embeds: MessageEmbed[] = [];

    for (const inventory of chunkedInventory) {

      const inventoryList = toNList(
        inventory.map(({ value: item, count }) => {
          // show equipped item in the list with symbol so it is easier to
          // overview what item is in equipped
          const equippedName = `${DIAMOND} ${item.name} x${count}`;

          if (player.equippedItems.some(x => x.id === item.id)) {
            return equippedName;
          }

          return `${item.name} x${count}`;
        }),
      );

      let footer = "\n---\n";

      footer += `${DIAMOND}: equipped/active`;

      const embed = new MessageEmbed(msg.author)
        .setColor("RANDOM")
        .setTitle("Inventory")
        .setDescription(inventoryList + footer);

      embeds.push(embed);

    }

    let pageIndex = 0;

    const menu = new Pagination(msg, embeds);

    menu.setSelectText("Select");
    menu.setOnSelect(index => pageIndex = index);

    await menu.run();

    const page = embeds[pageIndex];

    this.sendEmbed(msg, page);

    const prompt = new Prompt(msg);
    const answer = await prompt.ask("Please reply the index of the item you want to select: ");
    const index = parseInt(answer) - 1;

    validateNumber(index);
    validateIndex(index, chunkedInventory[pageIndex]);

    const { value: item, count } = chunkedInventory[pageIndex][index];
    const itemMenu = item.show();
    const sellingPrice = this.getSellingPrice(item.price);

    itemMenu.addField("Count", `x${count}`, true);
    itemMenu.addField("Selling Price", sellingPrice.toString(), true)

    const itemButton = new ButtonHandler(msg, itemMenu);

    item.actions(msg, itemButton, player);

    let sell = false;

    itemButton.addButton("sell", () => { sell = true });

    itemButton.addCloseButton();

    await itemButton.run();


    if (sell) {

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
