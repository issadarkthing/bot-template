import { Message, MessageEmbed } from "discord.js";
import { currency, code, toNList, validateIndex, validateNumber, BLUE_BUTTON } from "../utils";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/commandment";
import { ButtonHandler } from "../structure/ButtonHandler";
import { stripIndents } from "common-tags";

interface Item {
  name: string;
  price: number;
}

export default class extends Command {
  name = "shop";
  description = "buy custom role and rpg stuff";

  private toList(items: Item[], start = 1) {
    const list = toNList(
      items.map(x => `${x.name} ${code(x.price)} ${currency}`),
      start,
    );

    const lastIndex = (items.length - 1) + start;
    return [list, lastIndex] as const;
  }

  async exec(msg: Message, args: string[]) {

    const items = [
      ...Armor.all,
    ];
    const [arg1] = args;


    if (arg1) {

      const index = parseInt(arg1) - 1;

      validateNumber(index);
      validateIndex(index, items);

      const selected = items[index];

      const info = selected.show();
      const menu = new ButtonHandler(msg, info);

      menu.addButton(BLUE_BUTTON, "buy", () => {
        return selected.buy(msg);
      })

      menu.addCloseButton();

      await menu.run();

      return;
    }


    const [armorList] = this.toList(Armor.all);

    const rpgList = stripIndents`
      **Armor**
      ${armorList}
      `;

      const shop = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Shop")
      .setDescription(rpgList);

    msg.channel.send({ embeds: [shop] });

  }
}
