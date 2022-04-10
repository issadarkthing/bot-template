import { Command, CommandError } from "@jiman24/commandment";
import { Message } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { DIAMOND, toNList, validateNumber } from "../utils";
import { MessageEmbed } from "../structure/MessageEmbed";

export default class extends Command {
  name = "inventory";
  description = "show player's inventory";
  aliases = ["i", "inv"];
  maxWeapon = 2; // max equipped weapon

  async exec(msg: Message, args: string[]) {


    const player = await Player.fromUser(msg.author);
    const [arg1] = args;

    if (arg1) {

      const index = parseInt(arg1) - 1;

      validateNumber(index);

      const item = player.inventory[index];

      if (!item) {
        throw new CommandError("cannot find item");
      }

      const menu = new ButtonHandler(msg, item.show());

      item.actions(msg, menu, player);
      menu.addCloseButton();

      await menu.run();

      return;
    }

    const inventoryList = toNList(
      player.inventory.map(item => {
        // show equipped item in the list with symbol so it is easier to
        // overview what item is in equipped
        const equippedName = `${DIAMOND} ${item.name}`;

        if (player.equippedItems.some(x => x.id === item.id)) {
          return equippedName;
        }

        return item.name;
      })
    );

    let footer = "\n---\n";

    footer += `${DIAMOND}: equipped/active`;

    const embed = new MessageEmbed(msg.author)
      .setColor("RANDOM")
      .setTitle("Inventory")
      .setDescription(inventoryList + footer);

    msg.channel.send({ embeds: [embed] });

  }
}
