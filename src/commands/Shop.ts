import { Message, MessageEmbed } from "discord.js";
import { 
  currency, 
  code, 
  toNList, 
  validateIndex, 
  validateNumber, 
  BLUE_BUTTON,
} from "../utils";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/commandment";
import { ButtonHandler } from "../structure/ButtonHandler";
import { stripIndents } from "common-tags";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";

interface ItemLike {
  name: string;
  price: number;
}

export default class extends Command {
  name = "shop";
  description = "buy in-game items";

  private toList(items: ItemLike[], start = 1) {
    const list = toNList(
      items.map(x => `${x.name} ${code(x.price)} ${currency}`),
      start,
    );

    const lastIndex = (items.length - 1) + start;
    return [list, lastIndex] as const;
  }

  async exec(msg: Message, args: string[]) {

    const items = Item.all;
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


    const [armorList, len1] = this.toList(Armor.all);
    const [weaponList, len2] = this.toList(Weapon.all, len1 + 1);
    const [petList, len3] = this.toList(Pet.all, len2 + 1);
    const [skillList] = this.toList(Skill.all, len3 + 1);

    const rpgList = stripIndents`
      **Armor**
      ${armorList}

      **Weapon**
      ${weaponList}

      **Pets**
      ${petList}

      **Skills**
      ${skillList}
      `;

      const shop = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Shop")
      .setDescription(rpgList);

    msg.channel.send({ embeds: [shop] });

  }
}
