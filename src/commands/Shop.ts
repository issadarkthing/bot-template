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
import { stripIndents } from "common-tags";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";
import { MessageEmbed } from "../structure/MessageEmbed";
import { Pagination } from "@jiman24/discordjs-pagination";

export default class extends Command {
  name = "shop";
  description = "buy in-game items";

  async exec(msg: Message, args: string[]) {

    const [arg1, arg2] = args;
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

      const startIndex = parseInt(arg2) - 1 || 0;

      validateIndex(startIndex, items)

      const menu = new Pagination(msg, embed, startIndex);

      let index: null | number = null;

      menu.addCancelButton();
      menu.setSelectText("Buy");
      menu.setOnSelect((x) => { index = x });

      await menu.run();

      if (index === null) return;

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
