import { Message } from "discord.js";
import { Pet as BasePet } from "discordjs-rpg";
import { Player } from "./Player";

export abstract class Pet extends BasePet {
  abstract price: number;

  static get all(): Pet[] {
    return [
      new Monkey(),
      new Penguin(),
      new BlueBird(),
      new Pigeon(),
      new BeardedDragon(),
      new BabyDragon(),
      new Dog(),
    ];
  }

  async buy(msg: Message) {

    const player = Player.fromUser(msg.author);

    if (player.coins < this.price) {
      msg.channel.send("Insufficient amount");
      return;
    }

    if (player.inventory.some(x => x.id === this.id)) {
      msg.channel.send("You already own this item");
      return;
    }

    player.coins -= this.price;
    player.inventory.push(this);

    player.save();
    msg.channel.send(`Successfully bought **${this.name}**!`);
  }
}

export class Monkey extends Pet {
  name = "Monkey";
  id = "monkey";
  attack = 20;
  price = 13000;
}

export class Penguin extends Pet {
  name = "Penguin";
  id = "penguin";
  attack = 15;
  interceptRate = 0.2;
  price = 15000;
}

export class BlueBird extends Pet {
  name = "Blue Bird";
  id = "blue-bird";
  attack = 15;
  interceptRate = 0.2;
  price = 15000;
}

export class Pigeon extends Pet {
  name = "Pigeon";
  id = "pigeon";
  attack = 5;
  interceptRate = 0.4;
  price = 30000;
}

export class BeardedDragon extends Pet {
  name = "Bearded Dragon";
  id = "bearded-dragon";
  attack = 60;
  interceptRate = 0.1;
  price = 70000;
}

export class BabyDragon extends Pet {
  name = "Baby Dragon";
  id = "baby-dragon";
  attack = 20;
  interceptRate = 0.2;
  price = 55000;
}

export class Dog extends Pet {
  name = "Dog";
  id = "dog";
  attack = 10;
  interceptRate = 0.35;
  price = 60000;
}

