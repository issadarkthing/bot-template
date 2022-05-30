import { Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, MessageSelectMenu } from "discord.js";
import { MessageEmbed as Embed } from "./MessageEmbed";
import { chunk, toNList } from "../utils";

interface PaginationItem {
  id: string;
  name: string;
  description?: string;
  show(): MessageEmbed;
}

interface PaginationOptions<T> {
  msg: Message; 
  items: T[];
  // start index
  index?: number;
  // interaction timeout
  timeout?: number;
  // items per page
  chunkSize?: number;
  // embed's title
  title?: string;
  // skip multiplier
  skipCount?: number;
  // toggle page skipping
  enableSkip?: boolean;
  // change item to label to be displayed on embed
  toLabel?: (item: T) => string;
}

export class Pagination<T extends PaginationItem> {
  onSelect?: (item: T) => void;
  toLabel: (item: T) => string = (item) => item.name;
  skipBackwardButton: MessageButton;
  previousButton: MessageButton;
  nextButton: MessageButton;
  skipForwardButton: MessageButton;
  cancelButton: MessageButton;


  private title?: string;
  private msg: Message;
  private items: T[];
  private pages: MessageEmbed[] = [];
  private index?: number;
  private timeout?: number;
  private chunkSize?: number;
  private chunkedItems: T[][] = [];
  private enableSkip: boolean;
  private skipCount: number;
  private buttonList: MessageButton[] = [];


  constructor(options: PaginationOptions<T>) {
    this.msg = options.msg;
    this.items = options.items;
    this.index = options.index || 0;
    this.timeout = options.timeout || 120000;
    this.chunkSize = options.chunkSize || 10;
    this.title = options.title;
    this.enableSkip = options.enableSkip || false;
    this.skipCount = options.skipCount || 10;

    if (options.toLabel) {
      this.toLabel = options.toLabel;
    }

    if (this.items.length === 0) throw new Error("Items cannot be empty");

    this.chunkedItems = chunk(this.items, this.chunkSize);
    this.pages = this.chunkedItems.map((items, i) => { 
      const list = toNList(items.map(item => this.toLabel(item)), (i * 10) + 1);
      const embed = new Embed(this.msg.author)
        .setDescription(list);

      if (this.title) embed.setTitle(this.title);

      return embed;
    });

    this.skipBackwardButton = new MessageButton()
      .setCustomId(`previous x${this.skipCount}`)
      .setLabel(`Previous (x${this.skipCount})`)
      .setStyle("PRIMARY");

    this.previousButton = new MessageButton()
      .setCustomId("previous")
      .setLabel("Previous")
      .setStyle("PRIMARY");

    this.nextButton = new MessageButton()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle("PRIMARY");

    this.skipForwardButton = new MessageButton()
      .setCustomId(`next x${this.skipCount}`)
      .setLabel(`Next (x${this.skipCount})`)
      .setStyle("PRIMARY");

    this.cancelButton = new MessageButton()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle("DANGER");

    if (this.enableSkip) {

      this.buttonList = [
        this.skipBackwardButton,
        this.previousButton,
        this.nextButton,
        this.skipForwardButton,
        this.cancelButton,
      ];

    } else {

      this.buttonList = [
        this.previousButton,
        this.nextButton,
        this.cancelButton,
      ];

    }

  }

  private createSelectMenuRow(items: PaginationItem[]) {
    const options = items.map(x => {
      const option: any = { label: x.name, value: x.id };

      if (x.description) {
        option["description"] = x.description;
      }

      return option;
    });

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
          case this.skipBackwardButton.customId:
            page = page >= this.skipCount ? page - this.skipCount : this.pages.length - 1;
            break;
          case this.previousButton.customId:
            page = page > 0 ? --page : this.pages.length - 1;
            break;
          case this.nextButton.customId:
            page = page + 1 < this.pages.length ? ++page : 0;
            break;
          case this.skipForwardButton.customId:
            page = page + this.skipCount < this.pages.length ? page + this.skipCount : 0;
            break;
          case this.cancelButton.customId:
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
