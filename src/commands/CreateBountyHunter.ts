import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { Prompt } from "../structure/Prompt";
import { client } from "../index";
import { Player } from "../structure/Player";
import { bold } from "../utils";

export default class extends Command {
  name = "create";
  description = "create new character";

  async exec(msg: Message) {
    const prompt = new Prompt(msg);

    if (client.players.has(msg.author.id)) {
      throw new Error("your character has already been created");
    }

    const name = await prompt.ask("What's the name of your Bounty Hunter?");

    const collected = await prompt
      .collect("Please upload your Bounty Hunter nft", { max: 1 });

    const avatar = collected.attachments.first();

    if (!avatar) {
      throw new Error("no image was uploaded");
    }

    const player = new Player(msg.author, avatar.url);
    player.name = name;

    msg.channel.send({ embeds: [player.show()] });
    const confirmation = await prompt.ask(
      `You are about to create ${bold(player.name)}. Confirm? [y/n]`
    );

    if (confirmation !== "y") {
      throw new Error("player creation process failed");
    }

    player.save();
    msg.channel.send(`${bold(player.name)} has been created successfully!`);
  }
}
