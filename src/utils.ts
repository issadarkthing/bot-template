import { MersenneTwister19937, Random } from "random-js";

export function bold(str: string | number) {
  return `**${str}**`;
}

export function code(str: string | number) {
  return `\`${str}\``;
}

export function sleep(time: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), time * 1000);
  })
}

export const random = () => new Random(MersenneTwister19937.autoSeed());
