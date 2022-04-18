import { random, rangeChunk } from "../utils";

export const qualityNames = ["Normal", "Good", "Outstanding", "Excellent", "Masterpiece"] as const;
export type Quality = "Normal" | "Good" | "Outstanding" | "Excellent" | "Masterpiece";

export interface QualityItem {
  quality: Quality;
}

export enum QualityEnum {
  Normal = 0,
  Good,
  Outstanding,
  Excellent,
  Masterpiece,
}

export function getRarity(quality: Quality) {
  switch (quality) {
    case "Normal": return 0.5;
    case "Good": return 0.3;
    case "Outstanding": return 0.05;
    case "Excellent": return 0.025;
    case "Masterpiece": return 0.001;
  }
}

export function getMultiplier(quality: Quality) {
  switch (quality) {
    case "Normal": return 1;
    case "Good": return 2;
    case "Outstanding": return 3;
    case "Excellent": return 4;
    case "Masterpiece": return 5;
  }
}

export function getRange(min: number, max: number, quality: Quality, step = 1) {
  return rangeChunk(min, max, qualityNames.length, step)[QualityEnum[quality]];
}

export function getQuality(quality: Quality, arr: QualityItem[]) {
  const result = arr.filter(x => x.quality === quality);
  return result;
}

export function randomQuality() {

  for (const quality of qualityNames) {
    const rarity = getRarity(quality);

    if (random.bool(rarity)) {
      return quality;
    }
  }

  return qualityNames[0];
}

export function randomItem(arr: QualityItem[]) {
  const quality = randomQuality();
  const items = getQuality(quality, arr);
  const item = random.pick(items);

  return item;
}
