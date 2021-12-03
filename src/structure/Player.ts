import { User } from "discord.js";
import { client } from "../index";
import { Player as PlayerRPG } from "discordjs-rpg";
import { code } from "../utils";
import { Item } from "./Item";
import { Armor } from "./Armor";
import { Weapon } from "./Weapon";
import { Pet } from "./Pet";
import { Skill } from "./Skill";

export class Player extends PlayerRPG {
  name: string;
  shards = 0;
  level = 1;
  xp = 0;
  win = 0;
  hunt = 0;
  inventory: Item[] = [];

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

    const offset = player.level - 1;
    player.hp += offset * 10
    player.attack += offset * 2
    player.critDamage += offset * 0.01;

    player.inventory = player.inventory
      .map(inv => Item.all.find(x => x.id === inv.id)!);

    const pet = player.pet;
    if (pet) {
      const validPet = Pet.all.find(x => x.id === pet.id);
      validPet?.setOwner(player);
    }

    const skill = player.skill;
    if (skill) {
      const validSkill = Skill.all.find(x => x.id === skill.id);
      player.skill = validSkill;
    }

    const equippedArmors = player.equippedArmors
      .map(inv => Armor.all.find(x => x.id === inv.id)!);

    const equippedWeapons = player.equippedWeapons
      .map(inv => Weapon.all.find(x => x.id === inv.id)!);

    player.equippedArmors = [];
    player.equippedWeapons = [];

    for (const armor of equippedArmors) {
      player.equipArmor(armor);
    }

    for (const weapon of equippedWeapons) {
      player.equipWeapon(weapon);
    }

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
    const { 
      user, 
      attack,
      hp,
      armor,
      critChance,
      critDamage,
      ...data
    } = this;

    if (data.pet) {
      data.pet.owner = undefined;
    }

    client.players.set(this.id, data);
  }
}

export class PlayerNotFoundErr extends Error {}
