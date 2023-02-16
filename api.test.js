const superTest = require("supertest");

const server = require("./api/server");

const db = require("./data/db-config");

const jwt = require("jsonwebtoken");

const secret = require("./api/secrets/index");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

it("[0] env ayarları dogru mu", () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

describe("[Post] auth/login", () => {
  it("[1] login oluyor mu", async () => {
    const response = await superTest(server)
      .post("/api/auth/login")
      .send({ username: "bob", password: "1234" });
    expect(response.status).toBe(200);
  }, 1000);

  it("[2] hatalı bilgilerle login olmuyor", async () => {
    const response = await superTest(server)
      .post("/api/auth/login")
      .send({ username: "bobi", password: "12345" });
    expect(response.status).toBe(401);
  }, 1000);

  it("[6] doğru token var mı", async () => {
    const res = await superTest(server)
      .post("/api/auth/login")
      .send({ username: "bob", password: "1234" });
    const token = res.body.token;
    let tokenUsername;
    const jwtDecode = jwt.verify(
      token,
      secret.JWT_SECRET,
      (err, decodedToken) => {
        tokenUsername = decodedToken.username;
      }
    );
    expect(tokenUsername).toBe("bob");
  }, 1000);
});

describe("[POST] auth/register", () => {
  it("[3] yeni kullanıcı adı dogru donuyor", async () => {
    await superTest(server)
      .post("/api/auth/register")
      .send({ username: "bradpitt", password: "1234", role_name: "actor" });
    const newUser = await db("users").where("username", "bradpitt").first();
    expect(newUser.username).toBe("bradpitt");
  }, 1000);

  it("[4] returns status code 201", async () => {
    const newUser = await superTest(server)
      .post("/api/auth/register")
      .send({ username: "bradpitt", password: "1234", role_name: "actor" });
    expect(newUser.status).toBe(201);
  }, 1000);

  it("[5] admin rolü kayıt edilmiyor mu", async () => {
    const response = await superTest(server)
      .post("/api/auth/register")
      .send({ username: "bradpitt", password: "1234", role_name: "admin" });
    expect(response.body.message).toBe("Rol adı admin olamaz");
  }, 1000);
});

describe("[GET] /users",()=>{
  it("[7] login kullanıcı usersı alabiliyor", async () => {
    const response = await superTest(server)
    .post("/api/auth/login")
    .send({ username: "bob", password: "1234" });
    const token = response.body.token;
    const response2 = await superTest(server).get("/api/users").set("Authorization",token);
    expect(response2.body[0].username).toBe("bob")
  })
  it("[8]admin kullanıcısı usersı alabiliyor", async () => {
    const response = await superTest(server)
    .post("/api/auth/login")
    .send({ username: "bob", password: "1234" });
    const token = response.body.token;
    const response2 = await superTest(server).get("/api/users/1").set("authorization",token);
    expect(response2.body.username).toBe("bob")
  })
})