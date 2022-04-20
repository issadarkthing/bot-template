import { Message } from "discord.js";
import { 
  currency, 
  code, 
  toNList, 
  validateIndex, 
  validateNumber,
  cap, 
} from "../utils";
import { Armor } from "../structure/Armor";
import { Command, CommandError } from "@jiman24/commandment";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { stripIndents } from "common-tags";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";
import { MessageEmbed } from "../structure/MessageEmbed";
import { Pagination } from "@jiman24/discordjs-pagination";

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

    const [arg1] = args;
    const prefix = this.commandManager.prefix;

    if (arg1) {
    
      let items = [] as Item[] | null;

      switch (arg1) {
        case "armor": items = Armor.all; break;
        case "weapon": items = Weapon.all; break;
        case "pet": items = Pet.all; break;
        case "skill": items = Skill.all; break;
        default: items = null;
      }

      if (!items) {
        throw new CommandError("invalid category");
      }

      items.sort((a, b) => a.price - b.price);
      const embed = items
        .map(x => x.show().addField("Price", x.price.toString(), true));

      const menu = new Pagination(msg, embed);

      let index = 0;

      menu.setSelectText("Buy");
      menu.setOnSelect((x) => { index = x });

      await menu.run();

      const item = items[index];

      await item.buy(msg);

      return;
    }

    const rpgList = stripIndents`
      **Categories**
      armor
      weapon
      pet
      skill
      ------
      To open armor shop use command \`${prefix}${this.name} armor\`
      `;

      const shop = new MessageEmbed(msg.author)
      .setTitle("Shop")
      .setDescription(rpgList);

    this.sendEmbed(msg, shop);

  }
}
