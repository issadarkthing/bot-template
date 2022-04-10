import { Command, CommandError, Duration } from "@jiman24/commandment";
import { Message } from "discord.js";
import { Player } from "../structure/Player";
import { random, validateAmount, validateNumber } from "../utils";
import { MessageEmbed } from "../structure/MessageEmbed";

export default class extends Command {
  name = "gamble";
  aliases = ["g"];
  description = "slot machine game";
  symbols = ["🔵", "🔴", "⚪"];
  cooldown?: Duration | undefined = { minute: 1 };

  private allEqual(arr: string[]) {
    return arr.every(x => x === arr[0]);
  }

  private getColumn(index: number, arr: string[][]) {
    return arr.map(x => x[index]);
  }

  private getCrosses(arr: string[][]) {
    return [
      [arr[0][0], arr[1][1], arr[2][2]],
      [arr[0][2], arr[1][1], arr[2][0]],
    ];
  }

  async exec(msg: Message, args: string[]) {

    const arg1 = args[0];
    const amount = parseInt(arg1);
    const player = await Player.fromUser(msg.author);

    if (!arg1) {
      throw new CommandError("please specify bet amount");
    } 

    validateNumber(amount);
    validateAmount(amount, player.coins);

    const rows = Array(3)
      .fill(null)
      .map(() => Array(3).fill(null).map(() => random.pick(this.symbols)));

    let multiplier = 1;

    // row check
    for (const row of rows) {
      if (this.allEqual(row)) {
        multiplier++;
      }
    }

    // column check
    for (let i = 0; i < rows.length; i++) {
      const column = this.getColumn(i, rows);

      if (this.allEqual(column)) {
        multiplier++;
      }
    }

    // cross check
    for (const row of this.getCrosses(rows)) {
      if (this.allEqual(row)) {
        multiplier++;
      }
    }

    const result = rows
      .map(x => "**|** " + x.join("") + " **|**")
      .join("\n");

    const embed = new MessageEmbed(msg.author)
      .appendDescription(result);

    player.coins -= amount;

    if (multiplier === 1) {

      embed.appendDescription(`You lost **${amount}** coins!`);

    } else {
      const winAmount = multiplier * amount;
      player.coins += winAmount;
      embed.appendDescription(`You won **(x${multiplier}) ${winAmount}** coins!`);
    }

    this.sendEmbed(msg, embed);

    player.save();
  }
}
