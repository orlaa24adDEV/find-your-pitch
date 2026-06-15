import request from "supertest";
import app from "../app";
import prisma from "../config/db";
import { cleanDb, registerUser, loginUser } from "./helpers";

beforeEach(async () => {
  await cleanDb();
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user).toMatchObject({
      name: "Test User",
      email: "test@test.com",
      role: "user",
    });
    expect(res.body).not.toHaveProperty("password");
  });

  it("should reject duplicate email", async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(409);
  });

  it("should reject weak password", async () => {
    const res = await registerUser({ password: "123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await registerUser();
  });

  it("should login with valid credentials", async () => {
    const res = await loginUser();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("should reject invalid password", async () => {
    const res = await loginUser("test@test.com", "wrong");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh", () => {
  it("should refresh token with cookie", async () => {
    const registerRes = await registerUser();
    const cookies = registerRes.headers["set-cookie"];

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies as any);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("should reject without cookie", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("should clear refresh cookie", async () => {
    const registerRes = await registerUser();
    const cookies = registerRes.headers["set-cookie"];

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies as any);

    expect(res.status).toBe(200);
  });
});

describe("GET /api/auth/me", () => {
  it("should return user profile", async () => {
    const registerRes = await registerUser();
    const token = registerRes.body.accessToken;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("test@test.com");
  });

  it("should reject without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
