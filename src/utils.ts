import { MersenneTwister19937, Random } from "random-js";
import { isDeepStrictEqual } from "util"

export const BROWN = "#c66a10";
export const BLUE_BUTTON = "🔵";
export const WHITE_BUTTON = "⚪";
export const RED_BUTTON = "🔴";
export const BLACK_BUTTON = "⚫";
export const ATTOM_BUTTON = "⚛️";
export const RETURN_BUTTON = "↩️";
export const LEFTMOST_ARROW_BUTTON = "⏮️";
export const LEFT_ARROW_BUTTON = "◀️";
export const CURRENT_BUTTON = "⏺️";
export const RIGHT_ARROW_BUTTON = "▶️";
export const RIGHTMOST_ARROW_BUTTON = "⏭️";
export const REPEAT = "🔁";
export const DIAMOND = "🔹";
export const CROSSED_SWORD = "⚔️";

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

export const random = new Random(MersenneTwister19937.autoSeed());

export const currency = "Coin";


export function toNList(items: string[], start = 1) {
  if (items.length < 0) return "none";
  return items.map((x, i) => `${i + start}. ${x}`).join("\n");
}

class InvalidNumber extends Error {}

export function validateNumber(amount: number) {
  if (Number.isNaN(amount)) {
    throw new InvalidNumber("not a valid number");
  }
}

class InsufficientBalance extends Error {}
class ZeroAmount extends Error {}

export function validateAmount(amount: number, balance: number) {
  if (amount > balance) {
    throw new InsufficientBalance("insufficient balance");
  } else if (amount <= 0) {
    throw new ZeroAmount("zero amount is not allowed");
  }
}

class InvalidIndex extends Error {}

export function validateIndex<T>(index: number, arr: T[]) {
  if (index < 0 || index > arr.length - 1) 
    throw new InvalidIndex(`cannot find item in index ${index + 1}`);
}

function remove1<T>(item: T, arr: T[]) {
  const copy = [...arr];
  const index = copy.findIndex(x => isDeepStrictEqual(x, item));

  if (index !== undefined) {
    copy.splice(index, 1);
  }

  return copy;
}

export function remove<T>(item: T, arr: T[], count = 1) {
  for (let i = 0; i < count; i++) {
    arr = remove1(item, arr);
  }

  return arr;
}


export function formatPercent(num: number) {
  return `${(num * 100).toFixed(2)}%`
}
