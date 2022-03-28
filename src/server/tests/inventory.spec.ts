import { app } from "../server";
import request from "supertest";
import { expect } from "chai";


describe("GET /inventory", () => {

  it("returns array of items", async () => {
    const res = await request(app)
      .get("/inventory")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).to.be.instanceof(Array);
  })

  it("contains all valid fields", async () => {
    const res = await request(app)
      .get("/inventory")
      .set("Authorization", `Bot ${process.env.API_TOKEN}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body[0]).have.keys([
      "id",
      "name",
      "owner",
      "itemID",
    ]);
  })

})
