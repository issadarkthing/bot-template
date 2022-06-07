import { Armor } from "./structure/Armor";
import { Weapon } from "./structure/Weapon";
import { Pet } from "./structure/Pet";
import { Skill } from "./structure/Skill";
import { writeFileSync } from  "fs";
import { Monster } from "./structure/Monster";

function create(items: any[], filename: string) {
  const data = JSON.stringify(items, null, 2);
  writeFileSync(filename, data);
}

create(Armor.all, "armors.json");
create(Weapon.all, "weapons.json");
create(Skill.all, "skills.json");
create(Pet.all, "pets.json");
create(Monster.all, "monsters.json");

console.log("done importing items data to json file");
