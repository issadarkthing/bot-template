import { Command } from "@jiman24/commandment";
import { Message, MessageEmbed } from "discord.js";
import { Prompt } from "../structure/Prompt";
import { client } from "../index";
import { Player, AVATARS } from "../structure/Player";
import { bold } from "../utils";
import { Pagination } from "../structure/Pagination";

export default class extends Command {
  name = "create";
  description = "create new character";

  async exec(msg: Message) {
    const prompt = new Prompt(msg);

    if (client.players.has(msg.author.id)) {
      throw new Error("your character has already been created");
    }

    const name = await prompt.ask("What's the name of your character?");

    const pages = AVATARS.map(x => 
      new MessageEmbed()
        .setColor("RANDOM")
        .setImage(x)
        .setTitle("Please select your avatar")
    );

    let avatarUrl: null | string = null;
    const avatarMenu = new Pagination(msg, pages, msg.author.id);

    avatarMenu.setOnSelect(index => { avatarUrl = AVATARS[index] });

    await avatarMenu.run();

    if (!avatarUrl) {
      throw new Error("no avatar was selected");
    }

    const player = new Player(msg.author, avatarUrl);
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
    msg.channel.send(
      `Use \`${client.commandManager.prefix}profile\` to checkout your profile`
    )
  }
}
