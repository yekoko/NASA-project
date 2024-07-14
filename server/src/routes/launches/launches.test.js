const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches Api", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launch", () => {
    const testLaunchData = {
      mission: "ZTM156",
      rocket: "ZTM Experimental IS1",
      target: "Kepler-442 b",
      launchDate: "January 17, 21",
    };

    const testLaunchDataWithoutDate = {
      mission: "ZTM156",
      rocket: "ZTM Experimental IS1",
      target: "Kepler-442 b",
    };

    const testLaunchDataWithInvalidDate = {
      mission: "ZTM156",
      rocket: "ZTM Experimental IS1",
      target: "Kepler-442 b",
      launchDate: "aabb",
    };

    test("It should response with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testLaunchData)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(testLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(testLaunchDataWithoutDate);
    });

    test("It should catch missing require properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testLaunchDataWithoutDate)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property!",
      });
    });

    test("It should catch invalid date format", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testLaunchDataWithInvalidDate)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid Launch Date!",
      });
    });
  });

  describe("Test delete launch", () => {
    const testLaunchDeleteData = {
      ok: true,
    };
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .delete(`/v1/launches/206`)
        .expect(200);
      expect(response.body).toMatchObject(testLaunchDeleteData);
    });
    test("It should catch launch not found", async () => {
      const response = await request(app)
        .delete(`/v1/launches/1012`)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Launch not found!",
      });
    });
  });
});
