import request from "supertest";
import app from "../app";
import prisma from "../config/db";
import { cleanDb, registerUser, getAdminToken, createTestField, getAuthToken } from "./helpers";

beforeEach(async () => {
  await cleanDb();
});

describe("GET /api/fields", () => {
  it("should return empty list", async () => {
    const res = await request(app).get("/api/fields");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return fields with pagination", async () => {
    const token = await getAdminToken();
    await createTestField(token);
    await createTestField(token, { name: "Campo 2" });

    const res = await request(app).get("/api/fields?page=1&limit=10");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body).toMatchObject({
      total: 2,
      page: 1,
      totalPages: 1,
    });
  });

  it("should include favorited=false for anonymous", async () => {
    const token = await getAdminToken();
    await createTestField(token);

    const res = await request(app).get("/api/fields");
    expect(res.body.data[0]).toHaveProperty("favorited", false);
  });

  it("should include favorited for authenticated user", async () => {
    const adminToken = await getAdminToken();
    const fieldRes = await createTestField(adminToken);
    const fieldId = fieldRes.body.id;

    const userToken = await getAuthToken();
    await request(app)
      .post(`/api/favorites/${fieldId}`)
      .set("Authorization", `Bearer ${userToken}`);

    const res = await request(app)
      .get("/api/fields")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.body.data[0].favorited).toBe(true);
  });
});

describe("GET /api/fields/search", () => {
  it("should search by name", async () => {
    const token = await getAdminToken();
    await createTestField(token, { name: "Estadio Rosaleda" });
    await createTestField(token, { name: "Pista Azul" });

    const res = await request(app).get("/api/fields/search?q=rosaleda");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Estadio Rosaleda");
  });
});

describe("GET /api/fields/:id", () => {
  it("should return a field by id", async () => {
    const token = await getAdminToken();
    const created = await createTestField(token);
    const fieldId = created.body.id;

    const res = await request(app).get(`/api/fields/${fieldId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Campo Test");
  });

  it("should return 404 for non-existent field", async () => {
    const res = await request(app).get("/api/fields/99999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/fields (admin)", () => {
  it("should create a field as admin", async () => {
    const token = await getAdminToken();
    const res = await createTestField(token);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Campo Test",
      sport: "Fútbol",
    });
  });

  it("should reject creation as non-admin", async () => {
    const token = await getAuthToken();
    const res = await createTestField(token);
    expect(res.status).toBe(403);
  });

  it("should reject without auth", async () => {
    const res = await request(app).post("/api/fields").send({ name: "Test" });
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/fields/:id (admin)", () => {
  it("should update a field", async () => {
    const token = await getAdminToken();
    const created = await createTestField(token);
    const fieldId = created.body.id;

    const res = await request(app)
      .put(`/api/fields/${fieldId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Campo Actualizado", priceHour: 30 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Campo Actualizado");
    expect(res.body.priceHour).toBe(30);
  });
});

describe("DELETE /api/fields/:id (admin)", () => {
  it("should delete a field", async () => {
    const token = await getAdminToken();
    const created = await createTestField(token);
    const fieldId = created.body.id;

    const res = await request(app)
      .delete(`/api/fields/${fieldId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
