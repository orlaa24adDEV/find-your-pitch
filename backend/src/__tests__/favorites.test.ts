import request from "supertest";
import app from "../app";
import prisma from "../config/db";
import { cleanDb, getAdminToken, createTestField, getAuthToken, registerUser } from "./helpers";

let adminToken: string;
let userToken: string;
let fieldId: number;

beforeEach(async () => {
  await cleanDb();
  adminToken = await getAdminToken();
  const fieldRes = await createTestField(adminToken);
  fieldId = fieldRes.body.id;
  userToken = await getAuthToken();
});

describe("POST /api/favorites/:fieldId", () => {
  it("should add a favorite", async () => {
    const res = await request(app)
      .post(`/api/favorites/${fieldId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ favorited: true });
  });

  it("should remove a favorite on second toggle", async () => {
    await request(app)
      .post(`/api/favorites/${fieldId}`)
      .set("Authorization", `Bearer ${userToken}`);

    const res = await request(app)
      .post(`/api/favorites/${fieldId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ favorited: false });
  });

  it("should reject without auth", async () => {
    const res = await request(app).post(`/api/favorites/${fieldId}`);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/favorites", () => {
  it("should return empty list initially", async () => {
    const res = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return favorited fields", async () => {
    await request(app)
      .post(`/api/favorites/${fieldId}`)
      .set("Authorization", `Bearer ${userToken}`);

    const res = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(fieldId);
  });
});
