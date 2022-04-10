import { Command, CommandError } from "@jiman24/commandment";
import { Message } from "discord.js";
import { client } from "../bot";
import { bold } from "../utils";
import { Player } from "../structure/Player";
import { MessageEmbed } from "../structure/MessageEmbed";

export default class extends Command {
  name = "create";
  description = "create new character";

  async exec(msg: Message) {

    if (await client.players.has(msg.author.id)) {
      throw new CommandError("your character has already been created");
    }


    const avatarUrl = msg.author.avatarURL() || msg.author.defaultAvatarURL;
    const player = new Player(msg.author, avatarUrl);

    player.save();

    const { prefix } = client.commandManager;

    const embed = new MessageEmbed(msg.author)
      .appendDescription(`${bold(player.name)} has been created successfully!`)
      .appendDescription(`Use \`${prefix}profile\` to checkout your profile`)
      .appendDescription(`Use \`${prefix}battle\` to start battle monsters!`)
      .appendDescription(`Use \`${prefix}help\` to check out other commands!`);

    this.sendEmbed(msg, embed);
  }
}
