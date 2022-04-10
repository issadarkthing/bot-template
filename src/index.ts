import { client } from "./bot";
import path from "path";
import { CommandError } from "@jiman24/commandment";

client.commandManager.registerCommands(path.resolve(__dirname, "./commands"));

client.commandManager.registerCommandNotFoundHandler((msg, cmdName) => {
  msg.channel.send(`Cannot find command "${cmdName}"`);
})

client.commandManager.registerCommandOnCooldownHandler((msg, cmd, timeLeft) => {
  const { hours, minutes, seconds } = timeLeft;

  msg.channel.send(
    `You cannot run ${cmd.name} command after **${hours}h ${minutes}m ${seconds}s**`
  );
})

client.commandManager.registerCommandErrorHandler((err, msg) => {

  if (err instanceof CommandError) {
    msg.channel.send(err.message);
  } else {
    console.log(err);
  }
})

client.on("ready", () => console.log(client.user?.username, "is ready!"))
client.on("messageCreate", msg => client.commandManager.handleMessage(msg));


client.login(process.env.BOT_TOKEN);
