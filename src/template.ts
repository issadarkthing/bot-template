import { Armor } from "./structure/Armor";
import { Weapon } from "./structure/Weapon";
import { Pet } from "./structure/Pet";
import { Skill } from "./structure/Skill";
import { Item } from "./structure/Item";
import { writeFileSync } from  "fs";

function create(items: Item[], filename: string) {
  const data = JSON.stringify(items, null, 2);
  writeFileSync(filename, data);
}

create(Armor.all, "armors.json");
create(Weapon.all, "weapons.json");
create(Skill.all, "skills.json");
create(Pet.all, "pets.json");

console.log("done importing items data to json file");
