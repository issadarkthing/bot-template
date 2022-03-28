import { app } from "../server";
import request from "supertest";
import { expect } from "chai";


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

describe("PATCH /player/:id", () => {

  it("update player", async () => {
    const res = await request(app)
      .get("/player/948769926288650301")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    const oldBalance = res.body.coins;

    await request(app)
      .patch("/player/948769926288650301")
      .send({ coins: Math.floor(Math.random() * 10) })
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    const res1 = await request(app)
      .get("/player/948769926288650301")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    const newBalance = res1.body.coins;

    expect(oldBalance).to.not.equal(newBalance);

  })

})
