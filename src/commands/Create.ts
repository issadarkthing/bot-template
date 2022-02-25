import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { client } from "../index";
import { bold } from "../utils";
import { Player } from "../structure/Player";

export default class extends Command {
  name = "create";
  description = "create new character";

  async exec(msg: Message) {

    if (client.players.has(msg.author.id)) {
      throw new Error("your character has already been created");
    }


    const avatarUrl = msg.author.avatarURL() || msg.author.defaultAvatarURL;
    const player = new Player(msg.author, avatarUrl);

    player.save();

    const { prefix } = client.commandManager;

    msg.channel.send(`${bold(player.name)} has been created successfully!`);
    msg.channel.send(
      `Use \`${prefix}profile\` to checkout your profile`
    )
    msg.channel.send(`Use \`${prefix}battle\` to start battle monsters!`);
    msg.channel.send(`Use \`${prefix}help\` to check out other commands!`);
  }
}
