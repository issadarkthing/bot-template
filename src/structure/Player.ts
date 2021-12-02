import { User } from "discord.js";
import { client } from "../index";
import { Player as PlayerRPG } from "discordjs-rpg";
import { code } from "../utils";
import { Item } from "./Item";
import { Armor } from "./Armor";

export class Player extends PlayerRPG {
  name: string;
  shards = 0;
  level = 1;
  xp = 0;
  win = 0;
  hunt = 0;
  inventory: Item[] = [];
  activeArmors: Armor[] = [];

  constructor(user: User, imageUrl: string) {
    super(user);
    this.name = user.username;
    this.imageUrl = imageUrl;
  }

  static fromUser(user: User) {

    const data = client.players.get(user.id);

    if (!data) {
      throw new PlayerNotFoundErr("character has not been created");
    }

    const player = new Player(user, data.imageUrl);
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

    profile.addField("Win", code(this.win), true);
    profile.addField("Hunt", code(this.hunt), true);

    const winHuntPercent = (this.win / this.hunt) || 0;
    const winHuntStr = (winHuntPercent * 100).toFixed(2) + "%";
    profile.addField("Win/Hunt %", code(winHuntStr), true);

    profile.addField("Level", code(this.level), true);
    profile.addField("xp", `\`${this.xp}/${this.requiredXP()}\``, true);

    profile.addField("Armor", armor);

    return profile;
  }

  save() {
    const { user, ...data } = this;
    client.players.set(this.id, data);
  }
}

export class PlayerNotFoundErr extends Error {}
