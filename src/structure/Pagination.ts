import { Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, MessageSelectMenu } from "discord.js";
import { MessageEmbed as Embed } from "./MessageEmbed";
import { chunk, toNList } from "../utils";

interface PaginationItem {
  id: string;
  name: string;
  show(): MessageEmbed;
}

interface PaginationOptions<T> {
  msg: Message; 
  items: T[];
  index?: number;
  timeout?: number;
  chunkSize?: number;
  title?: string;
}

export class Pagination<T extends PaginationItem> {
  onSelect?: (item: T) => void;

  private title?: string;
  private msg: Message;
  private items: T[];
  private pages: MessageEmbed[] = [];
  private index?: number;
  private timeout?: number;
  private chunkSize?: number;
  private chunkedItems: T[][] = [];
  private buttonList = [
    new MessageButton().setCustomId("previous").setLabel("Previous").setStyle("PRIMARY"),
    new MessageButton().setCustomId("next").setLabel("Next").setStyle("PRIMARY"),
    new MessageButton().setCustomId("cancel").setLabel("Cancel").setStyle("DANGER"),
  ];

  constructor(options: PaginationOptions<T>) {
    this.msg = options.msg;
    this.items = options.items;
    this.index = options.index || 0;
    this.timeout = options.timeout || 120000;
    this.chunkSize = options.chunkSize || 10;
    this.title = options.title;

    if (this.items.length === 0) throw new Error("Items cannot be empty");

    this.chunkedItems = chunk(this.items, this.chunkSize);
    this.pages = this.chunkedItems.map((items, i) => { 
      const list = toNList(items.map(item => item.name), (i * 10) + 1);
      const embed = new Embed(this.msg.author)
        .setDescription(list);

      if (this.title) embed.setTitle(this.title);

      return embed;
    });
  }

  private createSelectMenuRow(items: PaginationItem[]) {
    const options = items.map(x => ({ label: x.name, value: x.id }));

    const selectMenu = new MessageSelectMenu()
      .setCustomId("pagination")
      .setPlaceholder("Nothing selected")
      .addOptions(options);

    return new MessageActionRow()
      .addComponents(selectMenu);
  }

  async run() {

    return new Promise<void>(async (resolve) => {
      let page = this.index!;

      const buttons = new MessageActionRow()
        .addComponents(this.buttonList);

      const selectMenu = this.createSelectMenuRow(this.chunkedItems[page]);

      const curPage = await this.msg.channel.send({
        embeds: [this.pages[page].setFooter({ 
          text: `Page ${page + 1} / ${this.pages.length}` 
        })],
        components: [buttons, selectMenu],
      });

      const filter = (i: MessageComponentInteraction) => {
        const isAuthor = i.user.id === this.msg.author.id;
        return isAuthor;
      }

      const collector = curPage.createMessageComponentCollector({
        filter,
        time: this.timeout,
      });

      collector.on("collect", async (i) => {

        if (i.isSelectMenu()) {
          const selectedItems = this.chunkedItems[page];
          const item = selectedItems.find(x => x.id === i.values[0])!;

          if (this.onSelect) this.onSelect(item);

          collector.stop();
          resolve();
          return;
        }

        switch (i.customId) {
          case this.buttonList[0].customId:
            page = page > 0 ? --page : this.pages.length - 1;
            break;
          case this.buttonList[1].customId:
            page = page + 1 < this.pages.length ? ++page : 0;
            break;
          case this.buttonList[2].customId:
            collector.stop();
            resolve();
            return;
          default:
            break;
        }

        try { await i.deferUpdate(); } catch {}

        const selectMenu = this.createSelectMenuRow(this.chunkedItems[page]);

        await i.editReply({
          embeds: [this.pages[page].setFooter({ 
            text: `Page ${page + 1} / ${this.pages.length}` 
          })],
          components: [buttons, selectMenu],
        });

        collector.resetTimer();

      });

      collector.on("end", (_, reason) => {
        if (reason !== "messageDelete") {
          curPage.delete().catch();
        }
      });
    })

  }
}
