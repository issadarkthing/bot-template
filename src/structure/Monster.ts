import { Fighter } from "discordjs-rpg";
import { code, currency, random } from "../utils";
import { Player } from "../structure/Player";

export class Alien extends Fighter {
  drop = random.integer(150, 500);
  xpDrop = random.integer(10, 35);
  difficulty: number;
  
  constructor(player: Player) {
    super(random.pick(names));
    this.difficulty = player.level;
    this.attack = player.attack + this.randomAttrib();
    this.hp = player.hp + this.randomAttrib();
    this.armor = player.armor + (this.randomAttrib() / 100);
    this.critChance = player.critChance + (this.randomAttrib() / 100);
    this.critDamage = player.critDamage + random.integer(0.01, 0.5);
  }

  private randomAttrib() {
    return random.integer(-3, this.difficulty);
  }

  show() {
    const profile = super.show();

    profile.addField(`${currency} Drop`, code(this.drop), true);
    profile.addField("xp Drop", code(this.xpDrop), true);

    return profile;
  }
}


const names = [
  "Ghaqnen",
  "Vaet'ak",
  "Xeteil",
  "Scigneon",
  "Eeslah",
  "Negnit",
  "Oslars",
  "Kreisu",
  "Krieldan",
  "Mecroks",
  "Qittids",
  "Thruds",
  "Qaan",
  "Zaakzeids",
  "Ingoi",
  "Altois",
  "Chudhah",
  "Xarqroks",
  "Shahlids",
  "Rerkall",
  "Cruunzek",
  "Giqrail",
  "Crul",
  "Khurkail",
  "Azons",
  "Ocha",
  "Oh'eall",
  "Vroqrors",
  "Grarieds",
  "Toci",
  "Trun",
  "Scerrod",
  "Goqeik",
  "Kracuits",
  "Yingors",
  "Lohluds",
  "Lidan",
  "Cek'aers",
  "Dicrill",
  "Mekreads",
  "Cax'un",
  "Qheds",
  "Gravvals",
  "Graankud",
  "Dhim'uh",
  "Manners",
  "Alkeat",
  "Starods",
  "Scemal",
  "Ur'ull",
  "Cax'un",
  "Qheds",
  "Gravvals",
  "Graankud",
  "Dhim'uh",
  "Manners",
  "Alkeat",
  "Starods",
  "Scemal",
  "Ur'ull",
  "Xascil",
  "Kuqneds",
  "Ankiels",
  "Kargid",
  "Thallea",
  "Chaimnad",
  "Omnor",
  "Nophex",
  "Krurlath",
  "Craerkrak",
]
