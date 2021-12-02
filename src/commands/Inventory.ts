import { Command } from "@jiman24/commandment";
import { Message, MessageEmbed } from "discord.js";
import { Armor } from "../structure/Armor";
import { ButtonHandler } from "../structure/ButtonHandler";
import { Player } from "../structure/Player";
import { BLUE_BUTTON, remove, toNList, validateNumber } from "../utils";

export default class extends Command {
  name = "inventory";
  description = "show player's inventory";
  aliases = ["i", "inv"];

  async exec(msg: Message, args: string[]) {

    try {

      const player = Player.fromUser(msg.author);
      const [arg1] = args;

      if (arg1) {

        const index = parseInt(arg1) - 1;

        validateNumber(index);

        const item = player.inventory[index];

        if (!item) {
          throw new Error("cannot find item");
        }

        const menu = new ButtonHandler(msg, item.show());

        if (item instanceof Armor) {

          if (player.equippedArmors.some(x => x.id === item.id)) {
            
            menu.addButton(BLUE_BUTTON, "unequip", () => {

              player.equippedArmors = remove(item, player.equippedArmors);
              player.inventory.push(item);
              player.save();

              msg.channel.send(`Successfully unequipped ${item.name}`);
            })

          } else {

            menu.addButton(BLUE_BUTTON, "equip", () => {

              player.equippedArmors.push(item);
              player.inventory = remove(item, player.inventory);
              player.save();

              msg.channel.send(`Successfully equipped ${item.name}`);

            })
          }

        }

        menu.addCloseButton();
        await menu.run();

        return;
      }

      const inventoryList = toNList(player.inventory.map(x => x.name));

      const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Inventory")
        .setDescription(inventoryList);

      msg.channel.send({ embeds: [embed] });

    } catch (err) {
      msg.channel.send((err as Error).message);
    }
  }
}
