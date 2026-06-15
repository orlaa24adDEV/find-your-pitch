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

describe("POST /api/bookings", () => {
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  it("should create a booking", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        fieldId,
        date: tomorrow(),
        startTime: "10:00",
        endTime: "11:00",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("unpaid");
  });

  it("should reject overlapping booking", async () => {
    const booking = {
      fieldId,
      date: tomorrow(),
      startTime: "10:00",
      endTime: "11:00",
    };

    await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send(booking);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send(booking);

    expect(res.status).toBe(409);
  });

  it("should reject invalid time (end before start)", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        fieldId,
        date: tomorrow(),
        startTime: "11:00",
        endTime: "10:00",
      });

    expect(res.status).toBe(400);
  });

  it("should reject without auth", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({ fieldId, date: tomorrow(), startTime: "10:00", endTime: "11:00" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/bookings/unpaid", () => {
  it("should return unpaid bookings", async () => {
    const tomorrow = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    };

    await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ fieldId, date: tomorrow(), startTime: "10:00", endTime: "11:00" });

    const res = await request(app)
      .get("/api/bookings/unpaid")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("POST /api/bookings/:id/pay", () => {
  it("should pay a booking", async () => {
    const tomorrow = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    };

    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ fieldId, date: tomorrow(), startTime: "10:00", endTime: "11:00" });

    const bookingId = bookingRes.body.id;

    const res = await request(app)
      .post(`/api/bookings/${bookingId}/pay`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });
});

describe("DELETE /api/bookings/:id", () => {
  it("should cancel a booking", async () => {
    const tomorrow = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    };

    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ fieldId, date: tomorrow(), startTime: "10:00", endTime: "11:00" });

    const bookingId = bookingRes.body.id;

    const res = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });
});

describe("GET /api/bookings/all (admin)", () => {
  it("should return all bookings for admin", async () => {
    const res = await request(app)
      .get("/api/bookings/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("should reject non-admin", async () => {
    const res = await request(app)
      .get("/api/bookings/all")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
