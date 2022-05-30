import { app } from "../server";
import supertest from "supertest";
import { expect } from "chai";

const request = supertest as any;

describe("GET /player", () => {
  it("returns array of players", async () => {
    const res = await request(app)
      .get("/player")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).to.be.instanceof(Array);
  })
})

describe("GET /player/:id", () => {


  it("returns object", async () => {
    const res = await request(app)
      .get("/player/948769926288650301")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).to.be.instanceof(Object);
  })

  it("contains all of the fields", async () => {
    const res = await request(app)
      .get("/player/948769926288650301")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).to.have.keys([
      "id",
      "name",
      "imageUrl",
      "coins",
      "level",
      "xp",
      "win",
      "hunt",
      "currentMonster",
    ])
  })

})
