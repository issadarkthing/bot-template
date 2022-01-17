import { Message, MessageEmbed } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { 
  LEFTMOST_ARROW_BUTTON, 
  LEFT_ARROW_BUTTON, 
  RIGHTMOST_ARROW_BUTTON, 
  RIGHT_ARROW_BUTTON,
} from "../utils";

type OnSelectCallback = (index: number) => Promise<void> | void;

export class Pagination {
  private onSelect?: OnSelectCallback;

  constructor(
    private msg: Message,
    private pages: MessageEmbed[],
    private userID: string,
    private index = 0
  ) {}

  setOnSelect(cb: OnSelectCallback) {
    this.onSelect = cb;
  }

  async run() {
    if (this.pages.length <= 0)
      throw new Error("cannot paginate with zero pages");

    const currentPage = this.pages[this.index];
    const menu = new ButtonHandler(this.msg, currentPage, this.userID);

    const prevPage = this.pages[this.index - 1];
    const nextPage = this.pages[this.index + 1];

    const pageHandler = (index: number) => {
      return async () => {
        const menu = new Pagination(this.msg, this.pages, this.userID, index);

        if (this.onSelect) {
          menu.setOnSelect(this.onSelect);
        }

        await menu.run();
      };
    };


    if (prevPage) {

      if (this.pages.length > 2) {
        menu.addButton(
          LEFTMOST_ARROW_BUTTON,
          pageHandler(0),
        );
      }

      menu.addButton(
        LEFT_ARROW_BUTTON,
        pageHandler(this.index - 1),
      );
    }

    const onSelect = this.onSelect;
    if (onSelect) {

      menu.addButton("select", () => onSelect(this.index));

    }

    if (nextPage) {
      menu.addButton(
        RIGHT_ARROW_BUTTON,
        pageHandler(this.index + 1),
      );

      if (this.pages.length > 2) {
        menu.addButton(
          RIGHTMOST_ARROW_BUTTON,
          pageHandler(this.pages.length - 1),
        );
      }
    }


    menu.addCloseButton();
    await menu.run();
  }
}
