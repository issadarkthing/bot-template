import { MessageEmbed as Embed, User } from "discord.js";

export class MessageEmbed extends Embed {
  constructor(user: User) {
    super();
    this.setColor("RANDOM");
    const iconURL = user.avatarURL() || user.defaultAvatarURL;
    this.setAuthor({ name: user.username, iconURL });
  }

  appendDescription(text: string ) {

    if (!this.description) {
      this.description = text;
      return this;
    }
      
    this.description += "\n" + text;

    return this;
  }
}
