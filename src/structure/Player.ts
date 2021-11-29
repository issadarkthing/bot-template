import { User } from "discord.js";
import { client } from "../index";
import { Player as PlayerRPG } from "discordjs-rpg";
import { code } from "../utils";

export class Player extends PlayerRPG {
  name: string;
  avatarUrl: string;
  shards = 0;
  level = 1;
  xp = 0;

  constructor(user: User, avatarUrl: string) {
    super(user);
    this.name = user.username;
    this.avatarUrl = avatarUrl;
  }

  static fromUser(user: User) {

    const data = client.players.get(user.id);

    if (!data) {
      throw new PlayerNotFoundErr("character has not been created");
    }

    const player = new Player(user, data.avatarUrl);
    Object.assign(player, data);

    return player;
  }

  /** required xp to upgrade to the next level */
  private requiredXP() {
    let x = 10;
    let lvl = this.level
    while (lvl > 1) {
      x += Math.round(x * 0.4);
      lvl--;
    }
    return x;
  }


  /** adds xp and upgrades level accordingly */
  addXP(amount: number) {
    this.xp += amount;
    const requiredXP = this.requiredXP();

    if (this.xp >= requiredXP) {
      this.level++;
      this.addXP(0);
    }
  }

  show() {
    const profile = super.show();
    const armorIndex = 8;
    const armor = profile.fields.at(armorIndex)!.value;
    profile.fields.at(armorIndex)!.name = "Amoran Shards";
    profile.fields.at(armorIndex)!.value = this.shards.toString();
    profile.fields.at(armorIndex)!.inline = true;

    profile.addField("Level", code(this.level), true);
    profile.addField("xp", `\`${this.xp}/${this.requiredXP()}\``, true);

    profile.addField("Armor", armor);

    profile.setThumbnail(this.avatarUrl);
    return profile;
  }

  save() {
    const { user, ...data } = this;
    client.players.set(this.id, data);
  }
}

export class PlayerNotFoundErr extends Error {}
