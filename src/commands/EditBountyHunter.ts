import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { Player } from "../structure/Player";
import { Prompt } from "../structure/Prompt";

export default class extends Command {
  name = "editbountyhunter";
  aliases = ["edit"];
  description = "edits your character";

  async exec(msg: Message) {
    const prompt = new Prompt(msg);

    const option = parseInt(await prompt.ask(
      `Which one do you want to edit? \n1. name\n2. nft\n3. cancel`
    ));

    const player = Player.fromUser(msg.author);

    switch (option) {
      case 1: {
        const name = await prompt.ask("What's the new name be?");

        player.name = name;
        break;
      }

      case 2: {
        const collected = await prompt.collect("Please upload new nft", { max: 1 });
        const image = collected.attachments.first();

        if (!image) 
          throw new Error("no image uploaded");

        player.imageUrl = image.url;
        break;
      }

      case 3: throw new Error("operation cancelled");

      default: throw new Error("invalid option");
    }

    player.save();
    msg.channel.send("Successfully edit your Bounty Hunter");
  }
}
