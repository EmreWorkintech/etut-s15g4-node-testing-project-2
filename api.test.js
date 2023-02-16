
const superTest = require("superTest")

const server = require("./api/server");

const db = require("./data/db-config");


beforeAll(async () => {
  await  db.migrate.rollback()
    await db.migrate.latest()
})

beforeEach(async () => {
    await  db.seed.run()
  })

afterAll(async () => {
    await  db.destroy()
})

it("[0] env ayarları dogru mu", () => {
    expect(process.env.NODE_ENV).toBe("testing")
})

describe("auth/login", () => {
    it("[1] login oluyor mu", async () => {
        const response= await superTest(server).post("/api/auth/login").send({username:"bob", password:"1234"})
        expect(response.status).toBe(200)
    }) 

    it("[2] hatalı bilgilerle login olmuyor", async () => {
        const response= await superTest(server).post("/api/auth/login").send({username:"bobi", password:"12345"})
        expect(response.status).toBe(401)
    }) 

})

