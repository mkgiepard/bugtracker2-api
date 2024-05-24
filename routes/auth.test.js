const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
dotenvExpand.expand(dotenv.config());

const { describe, it, before, after } = require("node:test");
const { assert, match, strictEqual, deepStrictEqual } = require("node:assert");

describe("POST /auth/login", () => {
  const BASE_URL = "http://localhost:3001";

  it("should return 200 and { accessToken, refreshToken } on a successful login", async () => {
    const data = {
      username: "mario",
      password: process.env.DEFAULT_PWD,
    };
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    responseJson = await response.json();
    strictEqual(response.status, 200);
    match(responseJson.accessToken, /[a-zA-Z0-9._]/);
    match(responseJson.refreshToken, /[a-zA-Z0-9._]/);
  });

  it("should return 401 on a missing User", async () => {
    const data = {
      username: "notauser",
      password: "somepwd",
    };
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    responseJson = await response.json();
    strictEqual(response.status, 401);
    deepStrictEqual(responseJson, { error: "Wrong user or password" });
  });

  it("should return 401 on a missing User with a password of existing User", async () => {
    const data = {
      username: "notauser",
      password: process.env.DEFAULT_PWD,
    };
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    responseJson = await response.json();
    strictEqual(response.status, 401);
    deepStrictEqual(responseJson, { error: "Wrong user or password" });
  });

  it("should return 401 on a wrong password", async () => {
    const data = {
      username: "Mario",
      password: "two",
    };
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    responseJson = await response.json();
    strictEqual(response.status, 401);
    deepStrictEqual(responseJson, { error: "Wrong user or password" });
  });
  it.todo("should return 500 if something goes wrong with bcrypt.compare", () => {});
  it.todo("should return 500 if something goes wrong with jwt.sign", () => {});
});
